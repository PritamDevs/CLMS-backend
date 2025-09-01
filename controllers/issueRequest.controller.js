

const IssueRequest = require('../models/issueRequest.model');
const Book = require('../models/book.model');

// Create a new book issue request
exports.createRequest = async (req, res) => {
  try {
    const { bookId } = req.body;
    const studentId = req.user.id; // assuming JWT middleware sets req.user

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const existingRequest = await IssueRequest.findOne({
      book: bookId,
      student: studentId,
      status: 'pending'
    });
    if (existingRequest) {
      return res.status(400).json({ message: 'Request already pending for this book' });
    }

    const request = new IssueRequest({
      book: bookId,
      student: studentId,
      status: 'pending',
      requestedAt: new Date()
    });

    await request.save();
    res.status(201).json({ message: 'Request submitted', request });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all requests made by the logged-in student
exports.getStudentRequests = async (req, res) => {
  try {
    const studentId = req.user._id;
    const requests = await IssueRequest.find({ student: studentId }).populate('book');
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all pending requests (for librarian/admin)
exports.getPendingRequests = async (req, res) => {
  try {
    const requests = await IssueRequest.find({ status: 'pending' }).populate('book student');
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update request status (approve or reject)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body; // status = "approved" | "rejected"

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const request = await IssueRequest.findById(id).populate('book');
    if (!request || request.status !== 'pending') {
      return res.status(404).json({ message: 'Pending request not found' });
    }

    // Handle approval
    if (status === 'approved') {
      if (request.book.copiesAvailable < 1) {
        return res.status(400).json({ message: 'No copies available' });
      }

      request.status = 'approved';
      request.respondedAt = new Date();
      await request.save();

      request.book.copiesAvailable -= 1;
      await request.book.save();

      return res.status(200).json({ message: 'Request approved', request });
    }

    // Handle rejection
    if (status === 'rejected') {
      request.status = 'rejected';
      request.respondedAt = new Date();
      request.rejectionReason = reason || 'Not specified';
      await request.save();

      return res.status(200).json({ message: 'Request rejected', request });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};



