import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/db.js";
import userRoutes from "./routes/userRoutes.js"
import errorHandling from "./middlewares/errorHandler.js";
import createUserTable from "./data/createUserTable.js";

dotenv.config();
const app = express();
const port = process.env.SERVER_PORT // || 3001         odstranit komentar potom
;

// middlewares
app.use(express.json());
app.use(cors());

// routes
app.use("/api", userRoutes);

// testing postgres connection
app.get("/", async (req, res) => {
    console.log("Attempting database connection"); 
    try {
        const result = await pool.query("SELECT current_database()");
        res.send(`Database name is: ${result.rows[0].current_database}`);
        console.log("Database connection successful"); 

    } catch (error) {
        console.error("Database connection failed:", error.message); 
        res.status(500).send("Failed to connect to the database."); 
    }
});

//error handling middleware
app.use(errorHandling);

//create table before starting server
createUserTable()

// server running
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});