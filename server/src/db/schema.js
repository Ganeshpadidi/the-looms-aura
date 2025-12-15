const pool = require('./index');

async function createTables() {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Collections table
        await client.query(`
      CREATE TABLE IF NOT EXISTS collections (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Subcollections table
        await client.query(`
      CREATE TABLE IF NOT EXISTS subcollections (
        id SERIAL PRIMARY KEY,
        collection_id INTEGER NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(collection_id, name)
      )
    `);

        // Products table with binary image storage
        await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        subcollection_id INTEGER NOT NULL REFERENCES subcollections(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        description TEXT,
        image BYTEA,
        image_mime_type VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        await client.query('COMMIT');
        console.log('Database tables created successfully');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating tables:', error);
        throw error;
    } finally {
        client.release();
    }
}

module.exports = { createTables };
