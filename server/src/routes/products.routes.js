const express = require('express');
const { query } = require('../db');
const multer = require('multer');
const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

// Middleware to verify token (simplified)
const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        const jwt = require('jsonwebtoken');
        jwt.verify(req.token, process.env.JWT_SECRET, (err, authData) => {
            if (err) {
                res.sendStatus(403);
            } else {
                req.authData = authData;
                next();
            }
        });
    } else {
        res.sendStatus(403);
    }
};

// Public: Get product image
router.get('/:id/image', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await query('SELECT data, mimetype FROM products WHERE id = ?', [id]);
        if (result.rows.length > 0) {
            const product = result.rows[0];
            res.setHeader('Content-Type', product.mimetype);
            res.send(product.data);
        } else {
            res.status(404).send('Image not found');
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Create product
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
    const { name, price, collectionId, subcollectionId } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: 'Image is required' });
    }

    try {
        const result = await query(
            'INSERT INTO products (name, price, collection_id, subcollection_id, filename, mimetype, data) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, price, collectionId, subcollectionId, file.originalname, file.mimetype, file.buffer]
        );
        const newItem = await query('SELECT id, name, price, collection_id, subcollection_id FROM products WHERE id = ?', [result.lastID]);
        res.json({
            ...newItem.rows[0],
            imageUrl: `/api/products/${newItem.rows[0].id}/image`
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Delete product
router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        await query('DELETE FROM products WHERE id = ?', [id]);
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
