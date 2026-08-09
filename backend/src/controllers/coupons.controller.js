const prisma = require("../config/prisma");

async function validate(req, res, next) {
  try {
    const { code } = req.params;
    const coupon = await prisma.coupon.findUnique({ where: { code } });
    if (!coupon || !coupon.actif || coupon.expiration < new Date()) {
      return res.status(404).json({ message: "Coupon invalide ou expiré." });
    }
    res.json(coupon);
  } catch (err) {
    next(err);
  }
}

// --- Admin ---

async function list(req, res, next) {
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { expiration: "desc" } });
    res.json(coupons);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const coupon = await prisma.coupon.create({ data: req.body });
    res.status(201).json(coupon);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await prisma.coupon.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { validate, list, create, remove };
