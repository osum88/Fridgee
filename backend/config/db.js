require('dotenv').config(); // Nacte promenne z .env souboru

const { Client } = require('pg');

const client = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT, 
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

async function testDbConnection() {
    try {
        await client.connect(); 

        const res = await client.query(`SELECT * FROM testuser`);
        console.log('Data z tabulky:');
        console.log(res.rows);
    } catch (err) {
        console.error('Chyba při připojování nebo dotazu na databázi:', err.message);
    } finally {
        await client.end(); 
        console.log('Spojení s databází uzavřeno.');
    }
}

testDbConnection(); 