const { createTables } = require('./src/db/schema');

createTables()
    .then(() => {
        console.log('✅ Database tables created successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Error creating tables:', error);
        process.exit(1);
    });
