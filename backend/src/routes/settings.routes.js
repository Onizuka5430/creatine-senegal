const router = require("express").Router();
const ctrl = require("../controllers/settings.controller");
const { requireAuth, requireAdmin } = require("../middlewares/auth");

router.get("/", ctrl.get);
router.put("/", requireAuth, requireAdmin, ctrl.update);

module.exports = router;
