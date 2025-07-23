import pool from "../config/db.js"; 

const createUserTable = async () => {
    const queryText = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(150) NOT NULL,
            age INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        )
    `;
    try {
        await pool.query(queryText);
        console.log("User table created if not exists."); 
    } catch (error) {
        console.error("Error creating user table:", error); 
    }
};

export default createUserTable;