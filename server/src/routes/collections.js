const express = require('express');
const pool = require('../db');
const { verifyToken } = require('./auth');
const router = express.Router();

// GET all collections
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, description FROM collections ORDER BY name'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching collections:', error);
        res.status(500).json({ error: 'Failed to fetch collections' });
    }
});

// POST create collection (Admin only)
router.post('/', verifyToken, async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }
        const result = await pool.query(
            'INSERT INTO collections (name, description) VALUES ($1, $2) RETURNING *',
            [name, description]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating collection:', error);
        if (error.code === '23505') { // Unique violation
            return res.status(409).json({ error: 'Collection with this name already exists' });
        }
        res.status(500).json({ error: 'Failed to create collection' });
    }
});

// DELETE collection (Admin only)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if collection exists
        const checkResult = await pool.query(
            'SELECT id FROM collections WHERE id = $1',
            [id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Collection not found' });
        }

        // Delete will cascade to subcollections and products if configured
        await pool.query('DELETE FROM collections WHERE id = $1', [id]);

        res.json({ message: 'Collection deleted successfully' });
    } catch (error) {
        console.error('Error deleting collection:', error);
        res.status(500).json({ error: 'Failed to delete collection' });
    }
});

// GET subcollections for a specific collection
router.get('/:id/subcollections', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT id, collection_id, name, description FROM subcollections WHERE collection_id = $1 ORDER BY name',
            [id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching subcollections:', error);
        res.status(500).json({ error: 'Failed to fetch subcollections' });
    }
});

// POST create subcollection (Admin only)
router.post('/:id/subcollections', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }
        const result = await pool.query(
            'INSERT INTO subcollections (collection_id, name, description) VALUES ($1, $2, $3) RETURNING *',
            [id, name, description]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating subcollection:', error);
        if (error.code === '23505') { // Unique violation
            return res.status(409).json({ error: 'Subcollection with this name already exists' });
        }
        res.status(500).json({ error: 'Failed to create subcollection' });
    }
});

// DELETE subcollection (Admin only)
router.delete('/:collectionId/subcollections/:subcollectionId', verifyToken, async (req, res) => {
    try {
        const { subcollectionId } = req.params;

        // Check if subcollection exists
        const checkResult = await pool.query(
            'SELECT id FROM subcollections WHERE id = $1',
            [subcollectionId]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Subcollection not found' });
        }

        // Delete will cascade to products if configured
        await pool.query('DELETE FROM subcollections WHERE id = $1', [subcollectionId]);

        res.json({ message: 'Subcollection deleted successfully' });
    } catch (error) {
        console.error('Error deleting subcollection:', error);
        res.status(500).json({ error: 'Failed to delete subcollection' });
    }
});

module.exports = router;

