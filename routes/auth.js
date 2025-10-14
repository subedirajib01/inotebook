const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Create a User using: POST "/api/auth/" . Doesnot require auth
// New Request: Header: content-type:application/json

router.post('/', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Enter a valid password').isLength({ min: 5 })
], async (req, res) => {
    const errors = validationResult(req);
    // if there are validation errors, return bad request
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Create the user and handle unique email / DB errors
    try {
        const user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
        });
        return res.status(201).json(user);
    } catch (err) {
        console.error('Error creating user:', err);
        // If it's a duplicate key error from Mongo (unique email), send a 400 with a helpful message
        if (err && err.code === 11000) {
            return res.status(400).json({ error: 'Please enter a unique value for email' ,message:err.message});
        }
        return res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router
