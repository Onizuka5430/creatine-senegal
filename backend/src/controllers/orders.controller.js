const prisma = require("../config/prisma");

// Frais de livraison simplifiés par ville (à ajuster selon les tarifs réels transporteur)
const FRAIS_LIVRAISON = {
  dakar: 1500,
  thies: 2000,
  "saint-louis": 2500,
  kaolack: 2500,
  autre: 3000,
};

async function calculerFraisLivraison(ville) {
  const cle = ville?.toLowerCase().trim();
  return FRAIS_LIVRAISON[cle] ?? FRAIS_LIVRAISON.autre;
}

// POST /api/orders  { items: [{productId, quantite}], ville, adresse, telephone, modePaiement, couponCode }
async function checkout(req, res, next) {
  try {
    const { items, ville, adresse, telephone, modePaiement, couponCode } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Le panier est vide." });
    }

    const produits = await prisma.product.findMany({
      where: { id: { in: items.map((i) => i.productId) } },
    });

    let sousTotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const produit = produits.find((p) => p.id === item.productId);
      if (!produit) return res.status(404).json({ message: `Produit ${item.productId} introuvable.` });
      if (!produit.disponible || produit.stock < item.quantite) {
        return res.status(400).json({ message: `Stock insuffisant pour ${produit.nom}.` });
      }
      const prixUnitaire = produit.promotion
        ? produit.prix * (1 - produit.promotion / 100)
        : produit.prix;
      sousTotal += prixUnitaire * item.quantite;
      orderItemsData.push({ productId: produit.id, quantite: item.quantite, prix: prixUnitaire });
    }

    // Coupon
    let reduction = 0;
    let livraisonGratuite = false;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if (coupon && coupon.actif && coupon.expiration > new Date()) {
        if (coupon.pourcentage) reduction += sousTotal * (coupon.pourcentage / 100);
        if (coupon.montantFixe) reduction += coupon.montantFixe;
        if (coupon.livraisonGratuite) livraisonGratuite = true;
      }
    }

    const fraisLivraison = livraisonGratuite ? 0 : await calculerFraisLivraison(ville);
    const total = Math.max(sousTotal - reduction, 0) + fraisLivraison;

    // Transaction : créer la commande + décrémenter le stock
    const order = await prisma.$transaction(async (tx) => {
      const nouvelleCommande = await tx.order.create({
        data: {
          userId: req.user.id,
          total,
          fraisLivraison,
          ville,
          adresse,
          telephone,
          modePaiement,
          couponCode: couponCode || null,
          items: { create: orderItemsData },
        },
        include: { items: { include: { product: true } } },
      });

      for (const item of orderItemsData) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantite } },
        });
      }

      await tx.payment.create({
        data: {
          orderId: nouvelleCommande.id,
          montant: total,
          methode: modePaiement,
          statut: modePaiement === "LIVRAISON" ? "EN_ATTENTE" : "EN_ATTENTE",
        },
      });

      return nouvelleCommande;
    });

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

async function myOrders(req, res, next) {
  try {
    const commandes = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { items: { include: { product: true } }, paiement: true },
      orderBy: { dateCreation: "desc" },
    });
    res.json(commandes);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const commande = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: { include: { product: true } }, paiement: true, user: true },
    });
    if (!commande) return res.status(404).json({ message: "Commande introuvable." });
    if (commande.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Accès interdit." });
    }
    res.json(commande);
  } catch (err) {
    next(err);
  }
}

// --- Admin ---

async function listAll(req, res, next) {
  try {
    const commandes = await prisma.order.findMany({
      include: { user: { select: { nom: true, prenom: true, email: true } }, items: true },
      orderBy: { dateCreation: "desc" },
    });
    res.json(commandes);
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { statut } = req.body;
    const commande = await prisma.order.update({
      where: { id: req.params.id },
      data: { statut },
    });
    res.json(commande);
  } catch (err) {
    next(err);
  }
}

module.exports = { checkout, myOrders, getOne, listAll, updateStatus };
