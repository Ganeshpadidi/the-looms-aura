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
        // In a real app, verify JWT here. For now, just checking presence or simple verify.
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

// Public: List collections
router.get('/', async (req, res) => {
    try {
        const result = await query('SELECT * FROM collections ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Create collection
router.post('/', verifyToken, async (req, res) => {
    const { name, slug } = req.body;
    try {
        const result = await query(
            'INSERT INTO collections (name, slug) VALUES (?, ?)',
            [name, slug]
        );
        // Fetch the created item
        const newItem = await query('SELECT * FROM collections WHERE id = ?', [result.lastID]);
        res.json(newItem.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Update collection
router.put('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { name, slug } = req.body;
    try {
        await query(
            'UPDATE collections SET name = ?, slug = ? WHERE id = ?',
            [name, slug, id]
        );
        const updatedItem = await query('SELECT * FROM collections WHERE id = ?', [id]);
        res.json(updatedItem.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Delete collection
router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        await query('DELETE FROM collections WHERE id = ?', [id]);
        res.json({ message: 'Collection deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Public: Get subcollections for a collection
router.get('/:id/subcollections', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await query('SELECT * FROM subcollections WHERE collection_id = ? ORDER BY created_at DESC', [id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Create subcollection
router.post('/:id/subcollections', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { name, slug } = req.body;
    try {
        const result = await query(
            'INSERT INTO subcollections (collection_id, name, slug) VALUES (?, ?, ?)',
            [id, name, slug]
        );
        const newItem = await query('SELECT * FROM subcollections WHERE id = ?', [result.lastID]);
        res.json(newItem.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
