const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const pool = require('./src/db/index');

async function updateSchema() {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        console.log('Adding display_order to collections...');
        await client.query(`
            ALTER TABLE collections 
            ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
        `);

        console.log('Adding display_order to subcollections...');
        await client.query(`
            ALTER TABLE subcollections 
            ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
        `);

        await client.query('COMMIT');
        console.log('✅ Schema updated successfully!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error updating schema:', error);
    } finally {
        client.release();
        pool.end();
    }
}

updateSchema();
