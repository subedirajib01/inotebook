const express =require('express');
const Notes = require('../models/Notes');
const router = express.Router();
const { body, validationResult } = require('express-validator');
var fetchUser=require('../middleware/fetchUser');


// Route 1: Get all the notes using: GET "/api/notes/fetchallnotes".login required 
router.get('/fetchallnotes',fetchUser, async (req,res)=>{
    try {
        const notes = await Notes.find({user:req.user.id})
        res.json(notes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
}) 


// Route 2: Add a new note using: POST "/api/notes/addnote".login required 
router.post('/addnote',fetchUser,[
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Description must be at least 5 characters').isLength({min:5})
], async (req,res)=>{
    try {
    const {title,description,tag}=req.body;
    // if there are validation errors, return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const note=new Notes({
        title,description,tag,user:req.user.id
    })
        const savedNote = await note.save()
    res.json(savedNote);
}
    catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
}) 

module.exports=router;

