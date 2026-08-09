const router = require("express").Router();
const ctrl = require("../controllers/coupons.controller");
const { requireAuth, requireAdmin } = require("../middlewares/auth");

router.get("/valider/:code", ctrl.validate);
router.get("/", requireAuth, requireAdmin, ctrl.list);
router.post("/", requireAuth, requireAdmin, ctrl.create);
router.delete("/:id", requireAuth, requireAdmin, ctrl.remove);

module.exports = router;
