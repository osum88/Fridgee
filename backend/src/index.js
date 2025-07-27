import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import errorHandling from "./middlewares/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import helmet from "helmet";
import cron from "node-cron";
import { cleanExpiredRefreshTokens } from "./tasks/cleanExpiredTokens.js";


dotenv.config();
const app = express();
const port = process.env.SERVER_PORT || 3001;

// secure HTTP headers
app.use(helmet()); 

// middlewares
app.use(express.json());
app.use(cors());

// routes
app.use("/api", userRoutes);
app.use("/api/auth", authRoutes);

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
    cron.schedule('0 3 * * *', () => {
        console.log('Running daily refresh token cleanup task...');
        cleanExpiredRefreshTokens();
    });
});