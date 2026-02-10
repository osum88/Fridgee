import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import errorHandling from "./middlewares/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import friendRoutes from "./routes/friendRoutes.js";
import foodInventoryRoutes from "./routes/foodInventoryRoutes.js";
import foodCatalogRoutes from "./routes/foodCatalogRoutes.js";
import foodCategoryRoutes from "./routes/foodCategoryRoutes.js";
import foodVariantRoutes from "./routes/foodVariantRoutes.js";
import foodRoutes from "./routes/foodRoutes.js";
import foodInstanceRoutes from "./routes/foodInstanceRoute.js";
import foodLabelRoutes from "./routes/foodLabelRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import helmet from "helmet";
import cron from "node-cron";
import cookieParser from "cookie-parser";
import { cleanExpiredRefreshTokens } from "./tasks/cleanExpiredTokens.js";
import rateLimit from "express-rate-limit";
import { dailyUpdateExchangeRate } from "./tasks/dailyUpdateExchangeRate.js";
import { cleanupInventoryData } from "./tasks/cleanupInventoryData.js";

dotenv.config();
const app = express();
const port = process.env.SERVER_PORT || 3001;

// secure HTTP headers
app.use(helmet());

// middlewares
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

//rate limit
const apiLimiter = rateLimit({
  //@TODO
  windowMs: 1 * 60 * 1000, //nastavit 15 potom
  max: 500,
  message: "Too many requests from this IP address, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  //@TODO
  windowMs: 1 * 60 * 1000, //nastavit 5 potom
  max: 15,
  message: "Too many requests from this IP address, please try again in 5 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});

// routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/friends", apiLimiter, friendRoutes);
app.use("/api/inventory", apiLimiter, foodInventoryRoutes);
app.use("/api/food-catalog", apiLimiter, foodCatalogRoutes);
app.use("/api/food-category", apiLimiter, foodCategoryRoutes);
app.use("/api/food-variant", apiLimiter, foodVariantRoutes);
app.use("/api/food", apiLimiter, foodRoutes);
app.use("/api/food-instance", apiLimiter, foodInstanceRoutes);
app.use("/api/food-label", apiLimiter, foodLabelRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", apiLimiter, userRoutes);

//not found
app.use((req, res, next) => {
  res.status(404).json({
    status: 404,
    message: "The resource was not found. Please check the URL.",
    data: null,
  });
});

//error handling middleware
app.use(errorHandling);

// server running
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);

  // spusteni po startu (v produkci je mozne odebrat)
  cleanExpiredRefreshTokens();
  dailyUpdateExchangeRate();
  cleanupInventoryData();

  // Každý den ve 3:00 - smazaní nepotřebných refresh tokenů
  cron.schedule("0 3 * * *", async () => {
    console.log("Running daily refresh token cleanup task...");
    try {
      await cleanExpiredRefreshTokens();
    } catch (e) {
      console.error(e);
    }
  });

  // Pondělí až pátek v 15:05 - Získání nového kuru pro měny
  cron.schedule("5 15 * * 1-5", async () => {
    console.log("Running daily exchange rate update task...");
    try {
      await dailyUpdateExchangeRate();
    } catch (e) {
      console.error(e);
    }
  });

  // Úterý ve 3:30 - Úklid inventáře
  cron.schedule("30 3 * * 2", async () => {
    console.log("Running weekly inventory data cleanup task...");
    try {
      await cleanupInventoryData();
    } catch (e) {
      console.error(e);
    }
  });
});
