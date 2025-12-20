const express = require('express');
const pool = require('../db');
const { verifyToken } = require('./auth');
const router = express.Router();

// GET all collections (Ordered)
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, description, display_order FROM collections ORDER BY display_order ASC, id ASC'
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

        // Get max order
        const maxOrderResult = await pool.query('SELECT MAX(display_order) as max_order FROM collections');
        const nextOrder = (maxOrderResult.rows[0].max_order || 0) + 1;

        const result = await pool.query(
            'INSERT INTO collections (name, description, display_order) VALUES ($1, $2, $3) RETURNING *',
            [name, description, nextOrder]
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

// PUT Reorder Collections
router.put('/reorder', verifyToken, async (req, res) => {
    try {
        const { orderedIds } = req.body; // Array of IDs in new order
        if (!Array.isArray(orderedIds)) {
            return res.status(400).json({ error: 'Invalid data format' });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            for (let i = 0; i < orderedIds.length; i++) {
                await client.query(
                    'UPDATE collections SET display_order = $1 WHERE id = $2',
                    [i + 1, orderedIds[i]]
                );
            }
            await client.query('COMMIT');
            res.json({ message: 'Collections reordered successfully' });
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error reordering collections:', error);
        res.status(500).json({ error: 'Failed to reorder collections' });
    }
});

// PUT Update Collection (Rename/Description)
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const result = await pool.query(
            'UPDATE collections SET name = COALESCE($1, name), description = COALESCE($2, description) WHERE id = $3 RETURNING *',
            [name, description, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Collection not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating collection:', error);
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Collection name already exists' });
        }
        res.status(500).json({ error: 'Failed to update collection' });
    }
});

// DELETE collection (Admin only)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM collections WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Collection not found' });
        }

        res.json({ message: 'Collection deleted successfully' });
    } catch (error) {
        console.error('Error deleting collection:', error);
        res.status(500).json({ error: 'Failed to delete collection' });
    }
});

// --- SUBCOLLECTIONS ---

// GET subcollections for a specific collection
router.get('/:id/subcollections', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT id, collection_id, name, description, display_order FROM subcollections WHERE collection_id = $1 ORDER BY display_order ASC, id ASC',
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

        // Get max order
        const maxOrderResult = await pool.query(
            'SELECT MAX(display_order) as max_order FROM subcollections WHERE collection_id = $1',
            [id]
        );
        const nextOrder = (maxOrderResult.rows[0].max_order || 0) + 1;

        const result = await pool.query(
            'INSERT INTO subcollections (collection_id, name, description, display_order) VALUES ($1, $2, $3, $4) RETURNING *',
            [id, name, description, nextOrder]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating subcollection:', error);
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Subcollection with this name already exists' });
        }
        res.status(500).json({ error: 'Failed to create subcollection' });
    }
});

// PUT Reorder Subcollections
router.put('/:id/subcollections/reorder', verifyToken, async (req, res) => {
    try {
        const { orderedIds } = req.body;
        if (!Array.isArray(orderedIds)) {
            return res.status(400).json({ error: 'Invalid data format' });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            for (let i = 0; i < orderedIds.length; i++) {
                await client.query(
                    'UPDATE subcollections SET display_order = $1 WHERE id = $2',
                    [i + 1, orderedIds[i]]
                );
            }
            await client.query('COMMIT');
            res.json({ message: 'Subcollections reordered successfully' });
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error reordering subcollections:', error);
        res.status(500).json({ error: 'Failed to reorder subcollections' });
    }
});

// PUT Update Subcollection
router.put('/:collectionId/subcollections/:subcollectionId', verifyToken, async (req, res) => {
    try {
        const { subcollectionId } = req.params;
        const { name, description } = req.body;

        const result = await pool.query(
            'UPDATE subcollections SET name = COALESCE($1, name), description = COALESCE($2, description) WHERE id = $3 RETURNING *',
            [name, description, subcollectionId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Subcollection not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating subcollection:', error);
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Subcollection name already exists' });
        }
        res.status(500).json({ error: 'Failed to update subcollection' });
    }
});

// DELETE subcollection (Admin only)
router.delete('/:collectionId/subcollections/:subcollectionId', verifyToken, async (req, res) => {
    try {
        const { subcollectionId } = req.params;
        const result = await pool.query('DELETE FROM subcollections WHERE id = $1 RETURNING id', [subcollectionId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Subcollection not found' });
        }

        res.json({ message: 'Subcollection deleted successfully' });
    } catch (error) {
        console.error('Error deleting subcollection:', error);
        res.status(500).json({ error: 'Failed to delete subcollection' });
    }
});

module.exports = router;
