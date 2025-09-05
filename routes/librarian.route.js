const express=require('express');
const { Register, login,Profile,AllRequests, UpdateRequestStatus,ReturnBook,suspendStudent,unsuspendStudent } = require('../controllers/librarian.controller');
const { auth } = require('../middleware/auth.middleware');
const router=express.Router()



router.post('/login',login)
router.post('/register',Register)
router.get('/profile/:id',auth(['librarian']),Profile)
router.get('/requests', auth(['librarian']), AllRequests);
router.put('/requests', auth(['librarian']), UpdateRequestStatus);
router.patch('/requests/return', auth(['librarian']), ReturnBook);
router.put('/student/suspend/:id',auth(['librarian']),suspendStudent);
router.put('/student/unsuspend/:id', auth(['librarian']),unsuspendStudent);

module.exports= router