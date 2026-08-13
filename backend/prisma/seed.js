const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

function slugify(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Catégories de base issues du cahier des charges — structure de la boutique,
// à remplir ensuite par l'admin avec ses propres produits.
const CATEGORIES = [
  { nom: "Créatine", description: "Créatine monohydrate et formes avancées" },
  { nom: "Protéines", description: "Whey, caséine, protéines végétales" },
  { nom: "Pré-workout", description: "Boosters d'énergie et de concentration" },
  { nom: "BCAA", description: "Acides aminés essentiels pour la récupération" },
  { nom: "Oméga 3", description: "Acides gras essentiels" },
  { nom: "Vitamines", description: "Multivitamines et minéraux" },
  { nom: "Accessoires", description: "Shakers, sacs de sport, gants" },
];

async function main() {
  console.log("Initialisation de la boutique...");

  // --- Compte administrateur ---
  // Identifiants pris depuis les variables d'environnement pour éviter tout
  // mot de passe codé en dur. À définir dans le .env (voir .env.example).
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminNom = process.env.ADMIN_NOM || "Admin";
  const adminPrenom = process.env.ADMIN_PRENOM || "Boutique";

  if (!adminEmail || !adminPassword) {
    console.error(
      "\nERREUR : ADMIN_EMAIL et ADMIN_PASSWORD doivent être définis dans le .env avant de lancer le seed.\n" +
        "Voir backend/.env.example pour le format attendu.\n"
    );
    process.exit(1);
  }

  if (adminPassword.length < 8) {
    console.error("\nERREUR : ADMIN_PASSWORD doit contenir au moins 8 caractères.\n");
    process.exit(1);
  }

  const adminExistant = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (adminExistant) {
    console.log(`Le compte admin ${adminEmail} existe déjà, aucune modification.`);
  } else {
    await prisma.user.create({
      data: {
        nom: adminNom,
        prenom: adminPrenom,
        email: adminEmail,
        motDePasse: await bcrypt.hash(adminPassword, 10),
        role: "ADMIN",
      },
    });
    console.log(`Compte admin créé : ${adminEmail}`);
  }

  // --- Réglages de la boutique (nom + WhatsApp, modifiables ensuite dans /admin/parametres) ---
  await prisma.storeSettings.upsert({
    where: { id: "main" },
    update: {},
    create: {
      id: "main",
      nomBoutique: process.env.BOUTIQUE_NOM || "Ma Boutique",
      whatsapp: process.env.BOUTIQUE_WHATSAPP || null,
    },
  });
  console.log("Réglages de la boutique initialisés (modifiables dans /admin/parametres).");

  // --- Catégories (structure de base, aucun produit de démo) ---
  for (const c of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: slugify(c.nom) },
      update: {},
      create: { ...c, slug: slugify(c.nom) },
    });
  }
  console.log(`${CATEGORIES.length} catégories prêtes.`);

  console.log("\nInitialisation terminée. La boutique est vierge, prête à recevoir ses produits.");
  console.log(`Connexion admin : ${adminEmail}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
