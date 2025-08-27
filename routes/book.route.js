
const express=require('express');
const { CreateBook,AllBook,deleteBook } = require('../controllers/book.controller');
const { auth } = require('../middleware/auth.middleware');
const router=express.Router()

router.post('/create',auth(['librarian']),CreateBook)
router.get('/all',auth(['librarian','student']),AllBook)
router.delete('/delete/:id',auth(['librarian']),deleteBook)

module.exports= router
