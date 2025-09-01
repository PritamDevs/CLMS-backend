const express=require('express');
const { Register, login,Profile,AllRequests, UpdateRequestStatus,ReturnBook } = require('../controllers/librarian.controller');
const { auth } = require('../middleware/auth.middleware');
const router=express.Router()


router.post('/login',login)
router.post('/register',Register)
router.get('/profile',auth(['librarian']),Profile)
router.get('/requests', auth(['librarian']), AllRequests);
router.put('/requests', auth(['librarian']), UpdateRequestStatus);
router.patch('/requests/return', auth(['librarian']), ReturnBook);



module.exports= router