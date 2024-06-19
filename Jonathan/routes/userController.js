const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const pool = require('../db');
const bcrypt = require('bcrypt');

dotenv.config();

// User signup controller
const signUp = async (req, res) => {
  const { username, password, email, isStaff } = req.body;

  try {
    // Check if user already exists
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into database
    await pool.query('INSERT INTO users (username, password, email, is_staff) VALUES (?, ?, ?, ?)', [username, hashedPassword, email, isStaff]);

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// User login controller
const login = async (req, res) => {
  const { username, password, isStaff, staffPin } = req.body;

  try {
    // Find user by username
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    const user = rows[0];

    // Check if user is staff and if staff PIN is required and correct
    if (isStaff && user.is_staff) {
      if (!staffPin || staffPin !== process.env.STAFF_PIN) {
        return res.status(400).json({ message: 'Invalid staff PIN' });
      }
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    // Define payload for JWT
    const payload = {
      id: user.id,
      username: user.username,
      is_staff: user.is_staff
    };

    // Generate JWT token
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Define the routes
router.post('/signup', signUp);
router.post('/login', login);

module.exports = router;
