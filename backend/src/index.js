require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const errorHandler = require("./middlewares/errorHandler");

const authRoutes = require("./routes/auth.routes");
const productsRoutes = require("./routes/products.routes");
const categoriesRoutes = require("./routes/categories.routes");
const ordersRoutes = require("./routes/orders.routes");
const paymentsRoutes = require("./routes/payments.routes");
const reviewsRoutes = require("./routes/reviews.routes");
const couponsRoutes = require("./routes/coupons.routes");
const adminRoutes = require("./routes/admin.routes");
const uploadRoutes = require("./routes/upload.routes");

const app = express();

// --- Sécurité & utilitaires globaux ---
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Limite le brute force sur les routes sensibles (login/register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: "Trop de tentatives, réessayez plus tard." },
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// --- Routes ---
app.get("/api/health", (req, res) => res.json({ status: "ok", service: "creatine-senegal-api" }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/coupons", couponsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);

// 404
app.use((req, res) => res.status(404).json({ message: "Route introuvable." }));

// Erreurs
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API Creatine Senegal en écoute sur http://localhost:${PORT}`);
});
