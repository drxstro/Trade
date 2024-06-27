const express = require('express');
const dotenv = require('dotenv');
const userController = require('./routes/userController'); // Correct import for user routes
const eventsRoutes = require('./routes/events');
const authMiddleware = require('./authMiddleware');
const pool = require('./db');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Set the correct MIME type for .js files
app.use(express.static('public', {
  setHeaders: (res, path, stat) => {
    if (path.endsWith('.js')) {
      res.set('Content-Type', 'application/javascript');
    }
  }
}));

// Routes
app.use('/api/users', userController); // Use userController for user-related routes
app.use('/api/events', authMiddleware, eventsRoutes); // Use events routes with authMiddleware

// Serve static files (frontend)
app.use(express.static('public'));

// Test database connection
pool.query('SELECT 1')
  .then(() => console.log('Database connection successful'))
  .catch(err => console.error('Database connection error:', err));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
});

module.exports = app; // Export the app for testing purposes if needed
