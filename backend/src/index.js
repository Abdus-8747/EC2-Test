require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { query, initDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const result = await query('SELECT NOW() as current_time');
    res.json({
      status: 'ok',
      service: 'backend',
      database: 'connected',
      db_time: result.rows[0].current_time,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      service: 'backend',
      database: 'disconnected',
      error: error.message,
    });
  }
});

// GET all items
app.get('/api/items', async (req, res) => {
  try {
    const result = await query('SELECT * FROM items ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to retrieve items' });
  }
});

// POST create item
app.post('/api/items', async (req, res) => {
  const { title } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const result = await query(
      'INSERT INTO items (title) VALUES ($1) RETURNING *',
      [title.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// PUT update item status
app.put('/api/items/:id', async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;

  try {
    const result = await query(
      'UPDATE items SET completed = $1 WHERE id = $2 RETURNING *',
      [Boolean(completed), id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Item not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// DELETE item
app.delete('/api/items/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query('DELETE FROM items WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ message: 'Item deleted successfully', item: result.rows[0] });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// Start the server
const startServer = async () => {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`Backend server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server due to database connection issue:', err);
    process.exit(1);
  }
};

startServer();

