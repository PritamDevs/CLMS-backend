const express=require('express');
const { Register, login,Profile,AllRequests, UpdateRequestStatus,ReturnBook,suspendStudent,unsuspendStudent } = require('../controllers/librarian.controller');
const { auth } = require('../middleware/auth.middleware');
const router=express.Router()



router.post('/login',login)
router.post('/register',Register)
router.get('/profile/:id',auth(['librarian']),Profile)

router.get('/requests/:id', auth(['librarian']), AllRequests);

router.put('/requests/:id', auth(['librarian']), UpdateRequestStatus);
router.patch('/requests/return', auth(['librarian']), ReturnBook);
router.put('/students/suspend/:id',auth(['librarian']),suspendStudent);
router.put('/students/unsuspend/:id', auth(['librarian']),unsuspendStudent);
router.get('/requests', auth(['librarian']), AllRequests);
router.get('/return-requests', auth(['librarian']), (req, res, next) => {
    req.query.status = "return_requested"; 
    next(); 
}, AllRequests);

module.exports= router