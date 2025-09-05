
const express=require('express');
const { CreateBook,UpdateBook,AllBook,deleteBook } = require('../controllers/book.controller');
const { auth } = require('../middleware/auth.middleware');
const Book=require('../models/book.model')
const router=express.Router()

router.post('/create',auth(['librarian']),CreateBook)
router.put('/update/:id',auth(['librarian']),UpdateBook)
router.get('/all',auth(['librarian','student']),AllBook)
router.delete('/delete/:id',auth(['librarian']),deleteBook)
router.get('/availability/:id', auth(['student', 'librarian']), async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const isAvailable = book.copiesAvailable > 0;
    res.status(200).json({ available: isAvailable });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});


module.exports= router
