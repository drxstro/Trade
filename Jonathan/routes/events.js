const express = require('express');
const router = express.Router();
const authMiddleware = require('../authMiddleware');
const pool = require('../db');

// Fetch all events
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [events] = await pool.query('SELECT * FROM events');
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Create an event (for all authenticated users)
router.post('/', authMiddleware, async (req, res) => {
  const { name, description, date, location } = req.body;
  const createdBy = req.user.id; // Assuming user ID is available in req.user

  try {
    if (!name || !description || !date || !location) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    await pool.query(
      'INSERT INTO events (name, description, date, location, created_by, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [name, description, date, location, createdBy]
    );
    res.status(201).json({ message: 'Event created successfully' });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update specific fields of an event (for all authenticated users)
router.patch('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, description, date, location } = req.body;

  try {
    await pool.query(
      'UPDATE events SET name = COALESCE(?, name), description = COALESCE(?, description), date = COALESCE(?, date), location = COALESCE(?, location) WHERE id = ?',
      [name, description, date, location, id]
    );
    res.json({ message: 'Event updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete an event (for all authenticated users)
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM events WHERE id = ?', [id]);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
