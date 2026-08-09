const router = require("express").Router();
const ctrl = require("../controllers/auth.controller");
const { requireAuth } = require("../middlewares/auth");

router.post("/register", ctrl.register);
router.post("/login", ctrl.login);
router.get("/profile", requireAuth, ctrl.profile);
router.put("/profile", requireAuth, ctrl.updateProfile);

module.exports = router;
