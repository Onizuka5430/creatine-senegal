const prisma = require("../config/prisma");

/**
 * NOTE IMPORTANTE :
 * Ce controller simule l'intégration Wave / Orange Money pour que le flux
 * complet (checkout -> paiement -> confirmation -> commande payée) soit
 * démontrable de bout en bout sans compte marchand réel.
 *
 * Pour la mise en prod, il faut remplacer initierPaiementWave /
 * initierPaiementOrangeMoney par de vrais appels aux API officielles :
 *  - Wave  : https://docs.wave.com  (Checkout API)
 *  - Orange Money : portail développeur Orange Money Sénégal (API Web Payment)
 * et vérifier la signature des webhooks entrants avant de valider un paiement.
 */

async function initierPaiementWave(req, res, next) {
  try {
    const { orderId } = req.body;
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ message: "Commande introuvable." });

    // --- Ici, en prod : appel réel à l'API Wave Checkout ---
    // const waveResponse = await fetch("https://api.wave.com/v1/checkout/sessions", {
    //   method: "POST",
    //   headers: { Authorization: `Bearer ${process.env.WAVE_API_KEY}` },
    //   body: JSON.stringify({ amount: order.total, currency: "XOF", ... }),
    // });

    const transactionId = `WAVE-${Date.now()}`;
    await prisma.payment.update({
      where: { orderId },
      data: { transactionId, statut: "EN_ATTENTE" },
    });

    res.json({
      // URL de paiement factice pour la démo (redirigerait vers Wave en prod)
      paymentUrl: `/paiement/simuler?transaction=${transactionId}&methode=wave`,
      transactionId,
    });
  } catch (err) {
    next(err);
  }
}

async function initierPaiementOrangeMoney(req, res, next) {
  try {
    const { orderId } = req.body;
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ message: "Commande introuvable." });

    const transactionId = `OM-${Date.now()}`;
    await prisma.payment.update({
      where: { orderId },
      data: { transactionId, statut: "EN_ATTENTE" },
    });

    res.json({
      paymentUrl: `/paiement/simuler?transaction=${transactionId}&methode=orange`,
      transactionId,
    });
  } catch (err) {
    next(err);
  }
}

// Simule le webhook envoyé par Wave/Orange Money après un paiement réussi.
// En prod : vérifier la signature du provider avant de faire confiance à ce payload.
async function confirmerPaiement(req, res, next) {
  try {
    const { transactionId, statut } = req.body; // statut: "REUSSI" | "ECHOUE"

    const paiement = await prisma.payment.findFirst({ where: { transactionId } });
    if (!paiement) return res.status(404).json({ message: "Transaction introuvable." });

    await prisma.payment.update({
      where: { id: paiement.id },
      data: { statut },
    });

    if (statut === "REUSSI") {
      await prisma.order.update({
        where: { id: paiement.orderId },
        data: { statut: "PAYEE" },
      });
    }

    res.json({ message: "Paiement mis à jour.", statut });
  } catch (err) {
    next(err);
  }
}

module.exports = { initierPaiementWave, initierPaiementOrangeMoney, confirmerPaiement };
