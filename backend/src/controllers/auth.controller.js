const bcrypt = require("bcryptjs");
const { z } = require("zod");
const prisma = require("../config/prisma");
const { signToken } = require("../utils/jwt");

const registerSchema = z.object({
  nom: z.string().min(2),
  prenom: z.string().min(2),
  email: z.string().email(),
  motDePasse: z.string().min(6),
  telephone: z.string().optional(),
  ville: z.string().optional(),
});

async function register(req, res, next) {
  try {
    const data = registerSchema.parse(req.body);

    const existant = await prisma.user.findUnique({ where: { email: data.email } });
    if (existant) {
      return res.status(409).json({ message: "Un compte existe déjà avec cet email." });
    }

    const hash = await bcrypt.hash(data.motDePasse, 10);
    const user = await prisma.user.create({
      data: { ...data, motDePasse: hash },
    });

    const token = signToken({ id: user.id, role: user.role, email: user.email });
    const { motDePasse, ...userSafe } = user;

    res.status(201).json({ user: userSafe, token });
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({ message: "Données invalides.", errors: err.errors });
    }
    next(err);
  }
}

const loginSchema = z.object({
  email: z.string().email(),
  motDePasse: z.string(),
});

async function login(req, res, next) {
  try {
    const { email, motDePasse } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect." });
    }

    const valide = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!valide) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect." });
    }

    const token = signToken({ id: user.id, role: user.role, email: user.email });
    const { motDePasse: _, ...userSafe } = user;

    res.json({ user: userSafe, token });
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({ message: "Données invalides.", errors: err.errors });
    }
    next(err);
  }
}

async function profile(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { commandes: { orderBy: { dateCreation: "desc" } } },
    });
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable." });
    const { motDePasse, ...userSafe } = user;
    res.json(userSafe);
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { nom, prenom, telephone, adresse, ville } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { nom, prenom, telephone, adresse, ville },
    });
    const { motDePasse, ...userSafe } = user;
    res.json(userSafe);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, profile, updateProfile };
