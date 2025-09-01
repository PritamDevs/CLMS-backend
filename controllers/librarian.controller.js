   
const Librarian = require("../models/librarian.model");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const issueRequest = require("../models/issueRequest.model");
const Book = require("../models/book.model");

module.exports.login = async (req, res) => {
    try {
        let { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required", success: false });
        }

        let librarian = await Librarian.findOne({ email });
        if (!librarian) {
            return res.status(400).json({ message: "Invalid email", success: false });
        }

        let isValidPassword = await bcrypt.compare(password, librarian.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: "Invalid Password", success: false });
        }

        delete librarian._doc.password;

        let payload = {
            name: librarian.name,
            email: librarian.email,
            phone: librarian.phone,
            id: librarian._id,
            type: "librarian"
        };

        let token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        return res.status(200).json({
            message: "Login successful",
            success: true,
            token,
            librarian
        });

    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Internal Server Error", success: false });
    }
};

module.exports.Register = async (req, res) => {
    try {
        let { name, email, password, cpassword, phone, address } = req.body;

        if (!name || !email || !password || !cpassword || !phone || !address) {
            return res.status(400).json({ message: "Please fill all fields", success: false });
        }

        if (password !== cpassword) {
            return res.status(400).json({ message: "Password and Confirm password are not same", success: false });
        }

        let existing = await Librarian.findOne({ $or: [{ email }, { phone }] });
        if (existing) {
            return res.status(400).json({ message: "Email or phone already exist", success: false });
        }

        if (!/^\d{10}$/.test(String(phone))) {
            return res.status(400).json({ message: "Invalid Phone Number", success: false });
        }

        let hashedPassword = await bcrypt.hash(password, 10);

        let newLibrarian = await Librarian.create({
            name,
            email,
            password: hashedPassword,
            phone,
            address
        });
        let librarianObj = newLibrarian.toObject();

        delete librarianObj.password;

        return res.status(201).json({
            message: "Librarian Registration Successfully",
            success: true,
            librarian: librarianObj
        });

    } catch (err) {
        console.error("Register error:", err);
        return res.status(500).json({ message: "Internal Server Error", success: false });
    }
};

module.exports.Profile = async (req, res) => {
    try {
        let data = await Librarian.findById(req.user.id);
        if (!data) {
            return res.status(404).json({ message: "Librarian not found", success: false });
        }
        delete data._doc.password;
        return res.json({ message: "Librarian profile", success: true, data });
    } catch (error) {
        console.error("Profile error:", error);
        return res.status(500).json({ message: "Internal Server Error", success: false });
    }
};

module.exports.AllRequests = async (req, res) => {
    try {
        // const requests = await issueRequest.find().populate("student book");
        // res.status(200).json({ message: "All book requests", success:true, requests });
    const { status } = req.query; 
    let query = {};
    if (status) {
      query.status = status;
    }
    const requests = await IssueRequest.find(query)
      .populate("student", "name email")
      .populate("book", "title copiesAvailable");

    return res.status(200).json({
      message: "Requests fetched successfully",
      success: true,
      requests,
    });


    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", success:false });
    }
};
module.exports.UpdateRequestStatus = async (req, res) => {
  try {
    const { requestId, status, rejectionReason } = req.body;

    const request = await IssueRequest.findById(requestId).populate("book");
    if (!request) return res.status(404).json({ message: "Request not found", success: false });

    if (status === "approved") {
      // Approving a new issue request → decrease stock
      if (request.status === "pending") {
        if (request.book.copiesAvailable <= 0) {
          return res.status(400).json({ message: "No copies available", success: false });
        }
        request.book.copiesAvailable -= 1;
        await request.book.save();
      }
      request.status = "approved";
      request.respondedAt = new Date();
    } 
    
    else if (status === "rejected") {
      request.status = "rejected";
      request.rejectionReason = rejectionReason || "Not specified";
      request.respondedAt = new Date();
    }

    else if (status === "returned") {
      // Librarian approves a return
      if (request.status !== "return_requested") {
        return res.status(400).json({ message: "Book must be return_requested before marking returned", success: false });
      }
      request.status = "returned";
      request.book.copiesAvailable += 1; // increase stock
      await request.book.save();
      request.respondedAt = new Date();
    }

    await request.save();
    return res.status(200).json({ message: "Request updated", success: true, request });
  } catch (err) {
    console.error("UpdateRequestStatus error:", err);
    return res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

module.exports.ReturnBook = async (req, res) => {
  try {
    const { requestId } = req.body;

    if (!requestId) {
      return res.status(400).json({ message: "requestId is required", success: false });
    }

    // Find the request with its book
    const request = await issueRequest.findById(requestId).populate('book');
    if (!request) {
      return res.status(404).json({ message: "Request not found", success: false });
    }

    // Only approved requests can be returned
    if (request.status !== "return_requested") {
      return res.status(400).json({ message: "This request is not approved, cannot return book", success: false });
    }

    // Mark request as returned
    request.status = "returned";
    request.returnedAt = new Date();

    // Increase available copies
    request.book.copiesAvailable += 1;

    await request.book.save();
    await request.save();

    return res.status(200).json({
      message: "Book returned successfully",
      success: true,
      request
    });

  } catch (err) {
    console.error("ReturnBook error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

