const { Pool } = require('pg');

// Test different connection strings
const connections = [
    'postgresql://postgres:postgres@localhost:5432/postgres',
    'postgresql://postgres:admin@localhost:5432/postgres',
    'postgresql://postgres:password@localhost:5432/postgres',
    'postgresql://postgres:root@localhost:5432/postgres',
];

async function testConnections() {
    console.log('Testing PostgreSQL connections...\n');

    for (let i = 0; i < connections.length; i++) {
        const connString = connections[i];
        const password = connString.split(':')[2].split('@')[0];

        console.log(`Trying password: "${password}"...`);

        try {
            const pool = new Pool({ connectionString: connString });
            const result = await pool.query('SELECT version()');
            console.log('✅ SUCCESS! This password works!\n');
            console.log('Update your .env file with:');
            console.log(`DATABASE_URL=postgresql://postgres:${password}@localhost:5432/looms_aura\n`);
            await pool.end();
            return;
        } catch (err) {
            console.log(`❌ Failed: ${err.message}\n`);
        }
    }

    console.log('None of the common passwords worked.');
    console.log('You need to find your PostgreSQL password.');
    console.log('\nTo find it:');
    console.log('1. Open pgAdmin 4');
    console.log('2. The password you enter to connect is your postgres password');
    console.log('3. Use that in the .env file');
}

testConnections();
