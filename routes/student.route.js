
const express=require('express');
const { login, Register,Profile,RequestBookIssue, MyRequests,RequestReturn,getAllStudents } = require('../controllers/student.controller');
const { auth } = require('../middleware/auth.middleware');
const router=express.Router()

router.post('/login',login)
router.post('/register',Register)
router.get('/profile',auth(['student']),Profile)
router.post('/request-book', auth(['student']), RequestBookIssue);
router.get('/my-requests', auth(['student']), MyRequests);
router.post("/request-return", auth(["student"]), RequestReturn);
router.get('/students/all', auth(['librarian']), getAllStudents); 

module.exports= router