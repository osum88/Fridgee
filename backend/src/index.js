import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js"
import errorHandling from "./middlewares/errorHandler.js";


dotenv.config();
const app = express();
const port = process.env.SERVER_PORT // || 3001         odstranit komentar potom
;

// middlewares
app.use(express.json());
app.use(cors());

// routes
app.use("/api", userRoutes);


//error handling middleware
app.use(errorHandling);


// server running
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});