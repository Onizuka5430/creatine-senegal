const prisma = require("../config/prisma");

async function ensureSettings() {
  return prisma.storeSettings.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main" },
  });
}

async function get(req, res, next) {
  try {
    const settings = await ensureSettings();
    res.json(settings);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { nomBoutique, whatsapp } = req.body;

    // Nettoie le numéro : garde uniquement les chiffres (format attendu par wa.me)
    const whatsappPropre = whatsapp ? whatsapp.replace(/[^0-9]/g, "") : null;

    await ensureSettings();
    const settings = await prisma.storeSettings.update({
      where: { id: "main" },
      data: {
        nomBoutique: nomBoutique || undefined,
        whatsapp: whatsappPropre,
      },
    });

    res.json(settings);
  } catch (err) {
    next(err);
  }
}

module.exports = { get, update };
