const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'testdb',
});

// Helper for running queries
const query = (text, params) => pool.query(text, params);

// Initialize database with table creation and retry mechanism
const initDB = async (retries = 5, delayMs = 3000) => {
  while (retries > 0) {
    try {
      console.log('Connecting to PostgreSQL database...');
      const client = await pool.connect();
      
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS items (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          completed BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `;
      
      await client.query(createTableQuery);
      client.release();
      console.log('Database connected successfully and schema initialized.');
      return;
    } catch (err) {
      retries -= 1;
      console.error(`Database connection failed (${err.message}). Retries left: ${retries}`);
      if (retries === 0) {
        console.error('Could not connect to database after multiple attempts.');
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
};

module.exports = {
  pool,
  query,
  initDB,
};

