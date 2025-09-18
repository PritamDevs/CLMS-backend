const express = require('express');
const { auth } = require('../middleware/auth.middleware');
const {
  createRequest,
  getStudentRequests,
  getPendingRequests,
  updateRequestStatus
} = require('../controllers/issueRequest.controller');

const router = express.Router();

router.post('/create', auth(['student']), createRequest);
router.get('/student/:id', auth(['student']), getStudentRequests);
router.get('/pending', auth(['librarian']), getPendingRequests);
router.patch('requests/:id', auth(['librarian']), updateRequestStatus);

module.exports = router;
