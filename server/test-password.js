const { Pool } = require('pg');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('PostgreSQL Password Tester\n');
console.log('This will help you find the correct password.\n');

rl.question('Enter your PostgreSQL password to test: ', async (password) => {
    console.log('\nTesting connection...');

    const pool = new Pool({
        connectionString: `postgresql://postgres:${password}@localhost:5432/postgres`
    });

    try {
        const result = await pool.query('SELECT version()');
        console.log('\n✅ SUCCESS! Password is correct!\n');
        console.log('PostgreSQL Version:', result.rows[0].version.split(',')[0]);
        console.log('\n📝 Update your .env file with this line:');
        console.log(`DATABASE_URL=postgresql://postgres:${password}@localhost:5432/looms_aura`);
        console.log('\nThen run: npm run seed');
    } catch (err) {
        console.log('\n❌ FAILED! This password is incorrect.');
        console.log('Error:', err.message);
        console.log('\nTips:');
        console.log('- Check if you entered the password correctly');
        console.log('- Try opening pgAdmin 4 to verify your password');
        console.log('- The password is case-sensitive');
    } finally {
        await pool.end();
        rl.close();
    }
});
