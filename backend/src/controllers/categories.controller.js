const prisma = require("../config/prisma");

async function list(req, res, next) {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { produits: true } } },
    });
    res.json(categories);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { nom, description } = req.body;
    const slug = nom.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const categorie = await prisma.category.create({ data: { nom, description, slug } });
    res.status(201).json(categorie);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, remove };
