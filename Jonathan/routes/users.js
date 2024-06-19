const express = require('express');
const router = express.Router();
const { signUp, login } = require('./userController');

// User sign-up route - use signUp controller function
router.post('/signup', signUp);

// User login route - use login controller function
router.post('/login', login);

module.exports = router;
