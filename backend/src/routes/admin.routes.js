const router = require("express").Router();
const ctrl = require("../controllers/admin.controller");
const { requireAuth, requireAdmin } = require("../middlewares/auth");

router.get("/dashboard", requireAuth, requireAdmin, ctrl.dashboard);

module.exports = router;
