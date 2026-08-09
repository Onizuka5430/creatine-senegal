const router = require("express").Router();
const ctrl = require("../controllers/orders.controller");
const { requireAuth, requireAdmin } = require("../middlewares/auth");

router.post("/", requireAuth, ctrl.checkout);
router.get("/mes-commandes", requireAuth, ctrl.myOrders);
router.get("/:id", requireAuth, ctrl.getOne);

router.get("/", requireAuth, requireAdmin, ctrl.listAll);
router.put("/:id/statut", requireAuth, requireAdmin, ctrl.updateStatus);

module.exports = router;
