const express = require('express');
const pool = require('../db');
const multer = require('multer');
const { verifyToken } = require('./auth');
const router = express.Router();

// Configure multer for in-memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// GET products for a specific subcollection
router.get('/subcollection/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT id, subcollection_id, name, price, description, image_mime_type 
       FROM products 
       WHERE subcollection_id = $1 
       ORDER BY name`,
            [id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// GET product image
router.get('/:id/image', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT image, image_mime_type FROM products WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0 || !result.rows[0].image) {
            return res.status(404).json({ error: 'Image not found' });
        }

        const { image, image_mime_type } = result.rows[0];
        res.set('Content-Type', image_mime_type || 'image/jpeg');
        res.set('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
        res.send(image);

    } catch (error) {
        console.error('Error fetching product image:', error);
        res.status(500).json({ error: 'Failed to fetch image' });
    }
});

// POST create new product (Admin only)
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
    try {
        const { subcollection_id, name, price, description } = req.body;

        if (!subcollection_id || !name || !price) {
            return res.status(400).json({ error: 'Subcollection ID, name, and price are required' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'Product image is required' });
        }

        const result = await pool.query(
            `INSERT INTO products (subcollection_id, name, price, description, image, image_mime_type)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, subcollection_id, name, price, description, image_mime_type`,
            [subcollection_id, name, parseFloat(price), description || '', req.file.buffer, req.file.mimetype]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// GET all subcollections (for admin dropdown)
router.get('/subcollections/all', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT s.id, s.name, c.name as collection_name 
       FROM subcollections s 
       JOIN collections c ON s.collection_id = c.id 
       ORDER BY c.name, s.name`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching subcollections:', error);
        res.status(500).json({ error: 'Failed to fetch subcollections' });
    }
});

module.exports = router;
