const router = require("express").Router();
const ctrl = require("../controllers/products.controller");
const { requireAuth, requireAdmin } = require("../middlewares/auth");

router.get("/", ctrl.list);
router.get("/id/:id", requireAuth, requireAdmin, ctrl.detailById);
router.get("/:slug", ctrl.detail);
router.post("/", requireAuth, requireAdmin, ctrl.create);
router.put("/:id", requireAuth, requireAdmin, ctrl.update);
router.delete("/:id", requireAuth, requireAdmin, ctrl.remove);

module.exports = router;
