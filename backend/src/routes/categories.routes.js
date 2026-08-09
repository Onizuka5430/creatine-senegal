const router = require("express").Router();
const ctrl = require("../controllers/categories.controller");
const { requireAuth, requireAdmin } = require("../middlewares/auth");

router.get("/", ctrl.list);
router.post("/", requireAuth, requireAdmin, ctrl.create);
router.delete("/:id", requireAuth, requireAdmin, ctrl.remove);

module.exports = router;
