const prisma = require("../config/prisma");

function slugify(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// GET /api/products?search=&categorie=&marque=&prixMin=&prixMax=&tri=&page=&limite=
async function list(req, res, next) {
  try {
    const {
      search,
      categorie,
      marque,
      prixMin,
      prixMax,
      disponible,
      tri = "recent",
      page = "1",
      limite = "12",
    } = req.query;

    const where = {
      AND: [
        search
          ? {
              OR: [
                { nom: { contains: search } },
                { description: { contains: search } },
              ],
            }
          : {},
        categorie ? { category: { slug: categorie } } : {},
        marque ? { marque: { contains: marque } } : {},
        prixMin ? { prix: { gte: parseFloat(prixMin) } } : {},
        prixMax ? { prix: { lte: parseFloat(prixMax) } } : {},
        disponible === "true" ? { disponible: true } : {},
      ],
    };

    const orderBy =
      tri === "prix_asc"
        ? { prix: "asc" }
        : tri === "prix_desc"
        ? { prix: "desc" }
        : tri === "populaire"
        ? { orderItems: { _count: "desc" } }
        : { dateCreation: "desc" };

    const skip = (parseInt(page) - 1) * parseInt(limite);
    const take = parseInt(limite);

    const [produits, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take,
        include: { category: true },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      produits,
      pagination: {
        total,
        page: parseInt(page),
        limite: take,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (err) {
    next(err);
  }
}

async function detail(req, res, next) {
  try {
    const produit = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: {
        category: true,
        avis: { where: { approuve: true }, include: { user: { select: { prenom: true } } } },
      },
    });
    if (!produit) return res.status(404).json({ message: "Produit introuvable." });
    res.json(produit);
  } catch (err) {
    next(err);
  }
}

// Utilisé par le formulaire admin (édition), qui travaille avec l'id et non le slug.
async function detailById(req, res, next) {
  try {
    const produit = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { category: true },
    });
    if (!produit) return res.status(404).json({ message: "Produit introuvable." });
    res.json(produit);
  } catch (err) {
    next(err);
  }
}

// --- Admin ---

async function create(req, res, next) {
  try {
    const data = req.body;
    const produit = await prisma.product.create({
      data: { ...data, slug: slugify(data.nom) + "-" + Date.now().toString(36) },
    });
    res.status(201).json(produit);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const produit = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(produit);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const id = req.params.id;

    // Un produit déjà commandé ne doit pas être supprimé pour de vrai — ça
    // casserait l'historique des commandes passées. On le masque à la place
    // (il n'apparaît plus sur la boutique, mais reste consultable dans les
    // anciennes commandes).
    const dejaCommande = await prisma.orderItem.count({ where: { productId: id } });
    if (dejaCommande > 0) {
      await prisma.product.update({ where: { id }, data: { disponible: false } });
      return res.json({
        masque: true,
        message:
          "Ce produit a déjà été commandé au moins une fois : il a été masqué de la boutique au lieu d'être supprimé, pour garder l'historique des commandes intact.",
      });
    }

    // Sinon, on peut le supprimer proprement (et nettoyer ses avis/favoris associés).
    await prisma.review.deleteMany({ where: { productId: id } });
    await prisma.favorite.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, detail, detailById, create, update, remove };
