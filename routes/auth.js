const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt= require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'Rajibisagoodb$oy';

// Create a User using: POST "/api/auth/createuser" . Doesnot require auth.. No login require 
// New Request: Header: content-type:application/json

router.post('/createuser', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Enter a valid password').isLength({ min: 5 })
], async (req, res) => {
    const errors = validationResult(req);
    // if there are validation errors, return bad request and the errors
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Create the user and handle unique email / DB errors
    // Check whether the user with this email exists already
    try {
        let user = await User.findOne({email:req.body.email})
        if (user){
            return res.status(400).json({error:"Sorry a user with this email already exists"}) 
        }

        const salt=await bcrypt.genSalt(10);
        const secPass= await bcrypt.hash(req.body.password,salt);
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
        });

        const data={
            user:{
                id:user.id
            }
            
        }
        const authtoken=jwt.sign(data,JWT_SECRET);

        res.json({authtoken:authtoken})

    } 
    catch (err) {
        console.error('Error creating user:', err);
        // If it's a duplicate key error from Mongo (unique email), send a 400 with a helpful message
        if (err && err.code === 11000) {
            return res.status(400).json({ error: 'Please enter a unique value for email' ,message:err.message});
        }
        return res.status(500).json({ error: 'Server error' });
    }
});



// Authenticate a User using: POST "/api/auth/login" . Doesnot require auth.. No login require 
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
    const errors = validationResult(req);
    // if there are validation errors, return bad request and the errors
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
const {email,password}=req.body;
    try{
        let user=await User.findOne({email});
        if(!user){
            return res.status(400).json({error:"Please try to login with correct credentials"});
        }
        const passwordCompare=await bcrypt.compare(password,user.password);
        if(!passwordCompare){
            return res.status(400).json({error:"Please try to login with correct credentials"});
        }
    const data={
            user:{
                id:user.id
            }
        }
        const authtoken=jwt.sign(data,JWT_SECRET);

        res.json({authtoken})
    }
    catch (err) {
        console.error('Error creating user:', err);
        // If it's a duplicate key error from Mongo (unique email), send a 400 with a helpful message
        if (err && err.code === 11000) {
            return res.status(400).json({ error: 'Please enter a unique value for email' ,message:err.message});
        }
        return res.status(500).json({ error: 'Internal Server error' });
    }
})

module.exports = router
