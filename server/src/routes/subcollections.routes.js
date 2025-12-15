const express = require('express');
const { query } = require('../db');
const router = express.Router();

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

// Admin: Update subcollection
router.put('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { name, slug } = req.body;
    try {
        await query(
            'UPDATE subcollections SET name = ?, slug = ? WHERE id = ?',
            [name, slug, id]
        );
        const updatedItem = await query('SELECT * FROM subcollections WHERE id = ?', [id]);
        res.json(updatedItem.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Delete subcollection
router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        await query('DELETE FROM subcollections WHERE id = ?', [id]);
        res.json({ message: 'Subcollection deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Public: Get products for a subcollection
router.get('/:id/products', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await query('SELECT id, name, price, collection_id, subcollection_id, created_at FROM products WHERE subcollection_id = ? ORDER BY created_at DESC', [id]);
        // Map to include imageUrl
        const products = result.rows.map(p => ({
            ...p,
            imageUrl: `/api/products/${p.id}/image`
        }));
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
