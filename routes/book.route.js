
const express=require('express');
const { CreateBook,AllBook,deleteBook } = require('../controllers/book.controller');
const { auth } = require('../middleware/auth.middleware');
const Book=require('../models/book.model')
const router=express.Router()

router.post('/create',auth(['librarian']),CreateBook)
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
module.exports.AllBook = async (req, res) => {
  try {
    const { category, author, title } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (author) filter.author = { $regex: author, $options: 'i' };
    if (title) filter.title = { $regex: title, $options: 'i' };

    const books = await Book.find(filter);
    res.status(200).json({ message: 'Filtered books', success: true, books });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', success: false });
  }
};

module.exports= router
