const pool = require('./db');
const { createTables } = require('./db/schema');
const fs = require('fs');
const path = require('path');

async function seedDatabase() {
    try {
        console.log('Creating tables...');
        await createTables();

        const client = await pool.connect();

        try {
            // Clear existing data
            await client.query('DELETE FROM products');
            await client.query('DELETE FROM subcollections');
            await client.query('DELETE FROM collections');

            // Reset sequences
            await client.query('ALTER SEQUENCE collections_id_seq RESTART WITH 1');
            await client.query('ALTER SEQUENCE subcollections_id_seq RESTART WITH 1');
            await client.query('ALTER SEQUENCE products_id_seq RESTART WITH 1');

            // Seed Collections
            const collections = [
                { name: 'Sarees', description: 'Traditional Indian sarees with exquisite designs' },
                { name: 'Kurtis', description: 'Modern and traditional kurtis for every occasion' },
                { name: 'Salwar Suits', description: 'Elegant salwar suits and dress materials' }
            ];

            for (const collection of collections) {
                await client.query(
                    'INSERT INTO collections (name, description) VALUES ($1, $2)',
                    [collection.name, collection.description]
                );
            }

            // Seed Subcollections
            const subcollections = [
                { collection_id: 1, name: 'Silk Sarees', description: 'Pure silk sarees' },
                { collection_id: 1, name: 'Cotton Sarees', description: 'Comfortable cotton sarees' },
                { collection_id: 1, name: 'Designer Sarees', description: 'Premium designer sarees' },
                { collection_id: 2, name: 'Casual Kurtis', description: 'Everyday wear kurtis' },
                { collection_id: 2, name: 'Party Wear Kurtis', description: 'Festive and party kurtis' },
                { collection_id: 3, name: 'Anarkali Suits', description: 'Flowing anarkali style suits' },
                { collection_id: 3, name: 'Punjabi Suits', description: 'Traditional Punjabi suits' }
            ];

            for (const subcollection of subcollections) {
                await client.query(
                    'INSERT INTO subcollections (collection_id, name, description) VALUES ($1, $2, $3)',
                    [subcollection.collection_id, subcollection.name, subcollection.description]
                );
            }

            // Seed Products (with placeholder image data)
            const products = [
                { subcollection_id: 1, name: 'Banarasi Silk Saree', price: 8999, description: 'Handwoven Banarasi silk saree with golden zari work' },
                { subcollection_id: 1, name: 'Kanjivaram Silk Saree', price: 12999, description: 'Traditional Kanjivaram silk saree' },
                { subcollection_id: 1, name: 'Mysore Silk Saree', price: 6999, description: 'Elegant Mysore silk saree' },
                { subcollection_id: 2, name: 'Handloom Cotton Saree', price: 1999, description: 'Pure handloom cotton saree' },
                { subcollection_id: 2, name: 'Block Print Cotton Saree', price: 2499, description: 'Beautiful block printed cotton saree' },
                { subcollection_id: 3, name: 'Embroidered Designer Saree', price: 15999, description: 'Heavy embroidered designer saree' },
                { subcollection_id: 3, name: 'Sequin Work Designer Saree', price: 18999, description: 'Contemporary designer saree with sequin work' },
                { subcollection_id: 4, name: 'Cotton Kurti', price: 799, description: 'Comfortable cotton kurti for daily wear' },
                { subcollection_id: 4, name: 'Printed Kurti', price: 999, description: 'Trendy printed kurti' },
                { subcollection_id: 5, name: 'Embroidered Party Kurti', price: 2499, description: 'Elegant embroidered kurti for parties' },
                { subcollection_id: 5, name: 'Velvet Party Kurti', price: 3499, description: 'Luxurious velvet kurti' },
                { subcollection_id: 6, name: 'Georgette Anarkali', price: 4999, description: 'Flowing georgette anarkali suit' },
                { subcollection_id: 6, name: 'Silk Anarkali', price: 6999, description: 'Premium silk anarkali suit' },
                { subcollection_id: 7, name: 'Cotton Punjabi Suit', price: 2999, description: 'Traditional cotton Punjabi suit' },
                { subcollection_id: 7, name: 'Phulkari Punjabi Suit', price: 5999, description: 'Authentic Phulkari embroidered suit' }
            ];

            // Create a simple placeholder image (1x1 transparent PNG in binary)
            const placeholderImageBuffer = Buffer.from(
                'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
                'base64'
            );

            for (const product of products) {
                await client.query(
                    'INSERT INTO products (subcollection_id, name, price, description, image, image_mime_type) VALUES ($1, $2, $3, $4, $5, $6)',
                    [product.subcollection_id, product.name, product.price, product.description, placeholderImageBuffer, 'image/png']
                );
            }

            console.log('Database seeded successfully!');
            console.log(`- ${collections.length} collections`);
            console.log(`- ${subcollections.length} subcollections`);
            console.log(`- ${products.length} products`);

        } finally {
            client.release();
        }

        await pool.end();

    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
