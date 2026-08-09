const prisma = require("../config/prisma");

async function dashboard(req, res, next) {
  try {
    const debutJour = new Date();
    debutJour.setHours(0, 0, 0, 0);

    const [
      nombreCommandes,
      commandesPayees,
      nombreClients,
      commandesDuJour,
      produitsStockFaible,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.findMany({ where: { statut: { in: ["PAYEE", "EN_PREPARATION", "EXPEDIEE", "LIVREE"] } } }),
      prisma.user.count({ where: { role: "CLIENT" } }),
      prisma.order.count({ where: { dateCreation: { gte: debutJour } } }),
      prisma.product.findMany({ where: { stock: { lte: 5 } }, select: { id: true, nom: true, stock: true } }),
    ]);

    const chiffreAffaires = commandesPayees.reduce((sum, c) => sum + c.total, 0);
    const panierMoyen = commandesPayees.length ? chiffreAffaires / commandesPayees.length : 0;

    const topProduits = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantite: true },
      orderBy: { _sum: { quantite: "desc" } },
      take: 5,
    });

    const produitsDetails = await prisma.product.findMany({
      where: { id: { in: topProduits.map((p) => p.productId) } },
      select: { id: true, nom: true },
    });

    const topProduitsAvecNom = topProduits.map((tp) => ({
      produit: produitsDetails.find((p) => p.id === tp.productId)?.nom || "Inconnu",
      quantiteVendue: tp._sum.quantite,
    }));

    res.json({
      nombreCommandes,
      chiffreAffaires,
      nombreClients,
      commandesDuJour,
      panierMoyen,
      produitsStockFaible,
      topProduits: topProduitsAvecNom,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { dashboard };
