const cloudinary = require("../config/cloudinary");

// Reçoit un fichier (via multer, en mémoire) et le pousse sur Cloudinary.
// Retourne l'URL publique à stocker dans le champ `photo` du produit.
async function uploadImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier reçu." });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return res.status(500).json({
        message:
          "Cloudinary n'est pas configuré. Renseigne CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET dans le .env du backend.",
      });
    }

    const uploadDepuisBuffer = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "creatine-senegal/produits" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

    const result = await uploadDepuisBuffer();
    res.json({ url: result.secure_url });
  } catch (err) {
    next(err);
  }
}

module.exports = { uploadImage };
