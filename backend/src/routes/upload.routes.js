const router = require("express").Router();
const multer = require("multer");
const ctrl = require("../controllers/upload.controller");
const { requireAuth, requireAdmin } = require("../middlewares/auth");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo max
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Seules les images sont acceptées."));
    }
    cb(null, true);
  },
});

router.post("/", requireAuth, requireAdmin, upload.single("image"), ctrl.uploadImage);

module.exports = router;
