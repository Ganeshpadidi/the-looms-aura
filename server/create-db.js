const { Pool } = require('pg');
require('dotenv').config();

async function checkAndCreateDatabase() {
    // First, connect to the default 'postgres' database
    const defaultPool = new Pool({
        connectionString: process.env.DATABASE_URL.replace('/looms_aura', '/postgres')
    });

    try {
        console.log('Connecting to PostgreSQL...');

        // Test connection
        await defaultPool.query('SELECT version()');
        console.log('✅ Connected to PostgreSQL successfully!\n');

        // Check if database exists
        console.log('Checking if looms_aura database exists...');
        const result = await defaultPool.query(
            "SELECT 1 FROM pg_database WHERE datname = 'looms_aura'"
        );

        if (result.rows.length === 0) {
            console.log('❌ Database "looms_aura" does not exist.');
            console.log('Creating database...');
            await defaultPool.query('CREATE DATABASE looms_aura');
            console.log('✅ Database "looms_aura" created successfully!\n');
        } else {
            console.log('✅ Database "looms_aura" already exists.\n');
        }

        console.log('Now you can run: npm run seed');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('\nPossible issues:');
        console.error('1. Wrong password in .env file');
        console.error('2. PostgreSQL is not running');
        console.error('3. Connection string format is incorrect');
        console.error('\nCurrent DATABASE_URL format should be:');
        console.error('postgresql://postgres:YOUR_PASSWORD@localhost:5432/looms_aura');
    } finally {
        await defaultPool.end();
    }
}

checkAndCreateDatabase();
