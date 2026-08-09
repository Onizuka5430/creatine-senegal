const prisma = require("../config/prisma");

async function create(req, res, next) {
  try {
    const { productId, note, commentaire } = req.body;
    const avis = await prisma.review.create({
      data: { userId: req.user.id, productId, note, commentaire },
    });
    res.status(201).json(avis);
  } catch (err) {
    next(err);
  }
}

// --- Admin : modération ---

async function listPending(req, res, next) {
  try {
    const avis = await prisma.review.findMany({
      where: { approuve: false },
      include: { user: { select: { nom: true, prenom: true } }, product: { select: { nom: true } } },
      orderBy: { dateCreation: "desc" },
    });
    res.json(avis);
  } catch (err) {
    next(err);
  }
}

async function approve(req, res, next) {
  try {
    const avis = await prisma.review.update({
      where: { id: req.params.id },
      data: { approuve: true },
    });
    res.json(avis);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await prisma.review.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { create, listPending, approve, remove };
