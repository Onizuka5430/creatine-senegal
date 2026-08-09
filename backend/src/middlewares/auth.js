const { verifyToken } = require("../utils/jwt");

// Vérifie qu'un token JWT valide est fourni (header Authorization: Bearer xxx)
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentification requise." });
  }
  const token = header.split(" ")[1];
  try {
    const decoded = verifyToken(token);
    req.user = decoded; // { id, role, email }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalide ou expiré." });
  }
}

// À utiliser après requireAuth : réserve la route aux administrateurs
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Accès réservé aux administrateurs." });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
