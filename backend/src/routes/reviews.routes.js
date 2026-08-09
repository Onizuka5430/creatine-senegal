const router = require("express").Router();
const ctrl = require("../controllers/reviews.controller");
const { requireAuth, requireAdmin } = require("../middlewares/auth");

router.post("/", requireAuth, ctrl.create);
router.get("/en-attente", requireAuth, requireAdmin, ctrl.listPending);
router.put("/:id/approuver", requireAuth, requireAdmin, ctrl.approve);
router.delete("/:id", requireAuth, requireAdmin, ctrl.remove);

module.exports = router;
