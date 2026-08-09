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

async function main() {
  console.log("Nettoyage de la base...");
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.user.deleteMany();

  console.log("Création de l'admin...");
  await prisma.user.create({
    data: {
      nom: "Diop",
      prenom: "Admin",
      email: "admin@creatine-senegal.com",
      motDePasse: await bcrypt.hash("Admin123!", 10),
      role: "ADMIN",
      ville: "Dakar",
    },
  });

  await prisma.user.create({
    data: {
      nom: "Fall",
      prenom: "Mamadou",
      email: "client@example.com",
      motDePasse: await bcrypt.hash("Client123!", 10),
      role: "CLIENT",
      ville: "Dakar",
      telephone: "+221 77 000 00 00",
    },
  });

  console.log("Création des catégories...");
  const categoriesData = [
    { nom: "Créatine", description: "Créatine monohydrate et formes avancées" },
    { nom: "Protéines", description: "Whey, caséine, protéines végétales" },
    { nom: "Pré-workout", description: "Boosters d'énergie et de concentration" },
    { nom: "BCAA", description: "Acides aminés essentiels pour la récupération" },
    { nom: "Oméga 3", description: "Acides gras essentiels" },
    { nom: "Vitamines", description: "Multivitamines et minéraux" },
    { nom: "Accessoires", description: "Shakers, sacs de sport, gants" },
  ];

  const categories = {};
  for (const c of categoriesData) {
    const cat = await prisma.category.create({
      data: { ...c, slug: slugify(c.nom) },
    });
    categories[c.nom] = cat;
  }

  console.log("Création des produits...");
  const produits = [
    {
      nom: "Créatine Monohydrate 500g",
      description:
        "Créatine monohydrate pure micronisée, la forme la plus étudiée scientifiquement pour la force et la prise de masse musculaire.",
      ingredients: "Créatine monohydrate 100% pure",
      dosage: "5g par jour, à mélanger dans de l'eau ou un shake",
      prix: 15000,
      promotion: 10,
      poids: "500g",
      marque: "MuscleTech",
      stock: 40,
      categorie: "Créatine",
    },
    {
      nom: "Créatine HCL 250g",
      description: "Créatine chlorhydrate à absorption rapide, sans rétention d'eau, sans phase de charge nécessaire.",
      ingredients: "Créatine HCL",
      dosage: "2g par jour",
      prix: 18000,
      poids: "250g",
      marque: "Optimum Nutrition",
      stock: 25,
      categorie: "Créatine",
    },
    {
      nom: "Whey Protéine Gold Standard 2kg",
      description: "Whey isolate/concentrate premium, 24g de protéines par dose, idéale pour la récupération post-entraînement.",
      ingredients: "Concentré et isolat de protéines de lactosérum",
      dosage: "1 dose (30g) après l'entraînement",
      prix: 45000,
      promotion: 5,
      poids: "2kg",
      marque: "Optimum Nutrition",
      stock: 30,
      categorie: "Protéines",
    },
    {
      nom: "Protéine Végétale Vanille 900g",
      description: "Protéine 100% végétale à base de pois et riz, sans lactose, idéale pour les intolérants.",
      ingredients: "Protéine de pois, protéine de riz, arôme vanille naturel",
      dosage: "1 dose (33g) par jour",
      prix: 32000,
      poids: "900g",
      marque: "MyProtein",
      stock: 18,
      categorie: "Protéines",
    },
    {
      nom: "Pré-Workout C4 Original",
      description: "Booster d'énergie et de concentration avec caféine, beta-alanine et créatine nitrate.",
      ingredients: "Caféine anhydre, beta-alanine, créatine nitrate, arginine AKG",
      dosage: "1 dose 20-30 min avant l'entraînement",
      prix: 22000,
      poids: "300g",
      marque: "Cellucor",
      stock: 22,
      categorie: "Pré-workout",
    },
    {
      nom: "BCAA 2:1:1 400g",
      description: "Acides aminés à chaîne ramifiée pour limiter le catabolisme musculaire pendant l'effort.",
      ingredients: "Leucine, isoleucine, valine (ratio 2:1:1)",
      dosage: "10g avant ou pendant l'entraînement",
      prix: 17000,
      promotion: 15,
      poids: "400g",
      marque: "Scitec Nutrition",
      stock: 35,
      categorie: "BCAA",
    },
    {
      nom: "Oméga 3 Huile de Poisson 120 capsules",
      description: "Concentré d'EPA/DHA pour la santé cardiovasculaire et articulaire des sportifs.",
      ingredients: "Huile de poisson concentrée (EPA 400mg / DHA 300mg par capsule)",
      dosage: "2 capsules par jour au repas",
      prix: 12000,
      poids: "120 capsules",
      marque: "Nordic Naturals",
      stock: 40,
      categorie: "Oméga 3",
    },
    {
      nom: "Multivitamines Sport 90 comprimés",
      description: "Formule complète de vitamines et minéraux adaptée aux besoins des sportifs intensifs.",
      ingredients: "Vitamines A, C, D, E, complexe B, zinc, magnésium, fer",
      dosage: "1 comprimé par jour",
      prix: 9000,
      poids: "90 comprimés",
      marque: "Animal Pak",
      stock: 50,
      categorie: "Vitamines",
    },
    {
      nom: "Shaker Premium 700ml",
      description: "Shaker étanche avec grille anti-grumeaux, compartiment à compléments intégré.",
      ingredients: null,
      dosage: null,
      prix: 4500,
      poids: "700ml",
      marque: "BlenderBottle",
      stock: 60,
      categorie: "Accessoires",
    },
    {
      nom: "Sac de sport Gym Bag",
      description: "Sac de sport résistant avec compartiment chaussures séparé, idéal pour la salle.",
      ingredients: null,
      dosage: null,
      prix: 16000,
      poids: null,
      marque: "Nike",
      stock: 15,
      categorie: "Accessoires",
    },
  ];

  for (const p of produits) {
    const { categorie, ...data } = p;
    await prisma.product.create({
      data: {
        ...data,
        slug: slugify(p.nom),
        categoryId: categories[categorie].id,
        disponible: true,
      },
    });
  }

  console.log("Création des coupons de démo...");
  await prisma.coupon.create({
    data: {
      code: "BIENVENUE10",
      pourcentage: 10,
      expiration: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.coupon.create({
    data: {
      code: "LIVRAISONGRATUITE",
      livraisonGratuite: true,
      expiration: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("Seed terminé avec succès.");
  console.log("Compte admin : admin@creatine-senegal.com / Admin123!");
  console.log("Compte client : client@example.com / Client123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
