const router = require("express").Router();
const ctrl = require("../controllers/payments.controller");
const { requireAuth } = require("../middlewares/auth");

router.post("/wave", requireAuth, ctrl.initierPaiementWave);
router.post("/orange-money", requireAuth, ctrl.initierPaiementOrangeMoney);
router.post("/webhook/confirmer", ctrl.confirmerPaiement); // appelé par le provider

module.exports = router;
