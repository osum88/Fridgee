import dotenv from 'dotenv';    // Nacte promenne z .env souboru
import pg from 'pg';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT, 
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

pool.on("connect", () => {
    console.log("Connection pool establised with database");
});

export default pool;


async function testDbConnection() {
    let client; 
    try {
        client = await pool.connect(); 

        const res = await client.query(`SELECT * FROM testuser`);
        console.log('Data z tabulky:');
        console.log(res.rows);
    } catch (err) {
        console.error('Chyba při připojování nebo dotazu na databázi:', err.message);
    } finally {
        if (client) {
            client.release(); 
            console.log('Klient vrácen do fondu.');
        }
        // Teprve teď ukončete celý fond
        await pool.end(); 
        console.log('Celý fond připojení s databází uzavřen.');
    }
}

// testDbConnection();
