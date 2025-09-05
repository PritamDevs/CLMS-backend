
const express=require('express');
const { login, Register,Profile,RequestBookIssue, MyRequests,RequestReturn } = require('../controllers/student.controller');
const { auth } = require('../middleware/auth.middleware');
const router=express.Router()

router.post('/login',login)
router.post('/register',Register)
router.get('/profile/:id',auth(['student']),Profile)
router.post('/request-book', auth(['student']), RequestBookIssue);
router.get('/my-requests', auth(['student']), MyRequests);
router.post("/request-return", auth(["student"]), RequestReturn);

module.exports= router