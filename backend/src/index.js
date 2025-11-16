import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import errorHandling from "./middlewares/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import friendRoutes from "./routes/friendRoutes.js"
import foodInventoryRoutes from "./routes/foodInventoryRoutes.js"
import foodCatalogRoutes from "./routes/foodCatalogRoutes.js"
import foodCategoryRoutes from "./routes/foodCategoryRoutes.js"
import adminRoutes from "./routes/adminRoutes.js";
import helmet from "helmet";
import cron from "node-cron";
import cookieParser from "cookie-parser";
import { cleanExpiredRefreshTokens } from "./tasks/cleanExpiredTokens.js";
import rateLimit from "express-rate-limit";


dotenv.config();
const app = express();
const port = process.env.SERVER_PORT || 3001;

// secure HTTP headers
app.use(helmet()); 

// middlewares
app.use(cookieParser());
app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL, 
    credentials: true, 
}));

//rate limit
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,                   //nastavit 15 potom
    max: 500, 
    message: "Too many requests from this IP address, please try again later.", 
    standardHeaders: true, 
    legacyHeaders: false, 
});

const authLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,                        //nastavit 5 potom
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
app.use("/api/admin", adminRoutes);
app.use("/api", apiLimiter, userRoutes);

//not found
app.use((req, res, next) => {
    res.status(404).json({
        status: 404,
        message: "The resource was not found. Please check the URL.",
        data: null
    });
});

//error handling middleware
app.use(errorHandling);


// server running
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
   
    cleanExpiredRefreshTokens(); 
    cron.schedule("0 3 * * *", () => {                //minuta, hodina, den, mesic, dev v tydnu 
        console.log("Running daily refresh token cleanup task...");
        cleanExpiredRefreshTokens();
    });
});