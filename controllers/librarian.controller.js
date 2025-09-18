const mongoose = require("mongoose");   
const Librarian = require("../models/librarian.model");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const issueRequest = require("../models/issueRequest.model");
const studentModel = require("../models/student.model");
const Book = require("../models/book.model");


module.exports.login = async (req, res) => {
    try {
        let { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required", success: false });
        }else{
        let librarian = await Librarian.findOne({ email:email });
        if (!librarian) {
            return res.status(400).json({ message: "Invalid email", success: false });
        }else{
        let isValidPassword = await bcrypt.compare(password, librarian.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: "Invalid Password", success: false });
        }else{
        delete librarian._doc.password;
        
        let payload = {
            name: librarian.name,
            email: librarian.email,
            phone: librarian.phone,
            _id: librarian._id,
            type: "librarian"
        };
        let token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        return res.status(200).json({
            message: "Login successful",success: true,token,librarian: payload});
      }
    }
  }

    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Internal Server Error", success: false });
    }
};

module.exports.Register = async (req, res) => {
    try {
        let { name, email, password, cpassword, phone} = req.body;

        if (!name || !email || !password || !cpassword || !phone) {
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
        });
        delete newLibrarian.password;
        return res.status(201).json({
            message: "Librarian Registration Successfully",
            success: true,
            newLibrarian
        });

    } catch (err) {
        console.error("Register error:", err);
        return res.status(500).json({ message: "Internal Server Error", success: false });
    }
};

module.exports.Profile = async (req, res) => {
    try {
        let _id = req.params.id;
        let librarian = await Librarian.findById(_id);
        if (!librarian) {
            return res.status(404).json({ message: "Librarian not found", success: false });
        }
        else{
        delete librarian._doc.password;
        return res.json({ message: "Librarian profile", success: true, librarian });
        }
    } catch (error) {
        console.error("Profile error:", error);
        return res.status(500).json({ message: "Internal Server Error", success: false });
    }
};
 

module.exports.suspendStudent = async (req, res) => {
  try {
    const studentId = req.params.id;
    const { reason } = req.body;
    const librarianId = req.user.id;

    const student = await studentModel.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found", success: false });
    }

    if (student.isSuspended) {
      return res.status(400).json({ message: "Student is already suspended", success: false });
    }

    student.isSuspended = true;
    student.suspendedBy = librarianId;
    student.suspensionReason = reason || "No reason provided";
    student.suspendedAt = new Date();

    await student.save();

    return res.status(200).json({
      message: "Student suspended successfully",
      success: true,
      student
    });
  } catch (error) {
    console.error("suspendStudent error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: error.message
    });
  }
};


 
module.exports.unsuspendStudent = async (req, res) => {
  try {
    const studentId = req.params.id;
    const librarianId = req.user.id; 

  const student = await studentModel.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found", success: false });
    }

    if (!student.isSuspended) {
      return res.status(400).json({ message: "Student is not suspended", success: false });
    }

    student.isSuspended = false;
    student.suspendedBy = null;
    student.suspensionReason = '';
    student.suspendedAt = null;
    student.unsuspendedBy = librarianId;
    student.unsuspendedAt = new Date();

    await student.save();

    return res.status(200).json({
      message: "Student unsuspended successfully",
      success: true,
      student
    });
  } catch (error) {
    console.error("unsuspendStudent error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: error.message
    });
  }
};


module.exports.AllRequests = async (req, res) => {
    try {
    const { status } = req.query; 
    let query = {};
    if (status) query.status = status;

    console.log("Fetching requests with query:", query);

    const requests = await issueRequest.find(query)
      .populate({path:"student",select: "name email",strictPopulate: false})
      .populate({path:"book", select:"title stockAvailable",strictPopulate: false});

    console.log("Fetched requests count:", requests.length);

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
// module.exports.UpdateRequestStatus = async (req, res) => {
//   try {
//     const requestId = req.params.id; 
//     const { status, rejectionReason } = req.body;

//     console.log("Updating request ID:", requestId);
//     console.log("Requested status:", status);

//     const request = await issueRequest.findById(requestId).populate("book");
//     if (!request) 
//       return res.status(404).json({ message: "Request not found", success: false });

//     if (status === "approved") {
//       // Approving a new issue request → decrease stock
//       if (request.status === "pending") {
//         if (request.book.stock <= 0) {
//           return res.status(400).json({ message: "No stock available", success: false });
//         }
//         request.book.stock-= 1;
//         await request.book.save();
//       }
//       request.status = "approved";
//       request.respondedAt = new Date();
//       request.book.stock -= 1;
//       await request.book.save();
//     } 
    
//     else if (status === "rejected") {
//          if (request.status !== "pending") {
//         return res.status(400).json({ message: "Only pending requests can be rejected", success: false });
//       }
//       request.status = "rejected";
//       request.rejectionReason = rejectionReason || "Not specified";
//       request.respondedAt = new Date();
//     }

//     else if (status === "returned") {
//       // Librarian approves a return
//       if (request.status !== "return_requested") {
//         return res.status(400).json({ message: "Book must be return_requested before marking returned", success: false });
//       }
//       request.status = "returned";
//       request.book.stock += 1; // increase stock
//       await request.book.save();
//       request.respondedAt = new Date();
//     }

//     await request.save();
//     return res.status(200).json({ message: "Request updated", success: true, request });
//   } catch (err) {
//     console.error("UpdateRequestStatus error:", err);
//     return res.status(500).json({ message: "Internal Server Error", success: false });
//   }
// };
module.exports.UpdateRequestStatus = async (req, res) => {
  try {
    const requestId = req.params.id;
    const { status, rejectionReason } = req.body;

    console.log("Updating request ID:", requestId, "to status:", status);

    const request = await issueRequest.findById(requestId).populate("book");
    if (!request) 
      return res.status(404).json({ message: "Request not found", success: false });

    // ---- APPROVE ISSUE ----
    if (status === "approved") {
      if (request.status !== "pending") {
        return res.status(400).json({ message: "Only pending requests can be approved", success: false });
      }
      if (request.book.stock <= 0) {
        return res.status(400).json({ message: "No stock available", success: false });
      }
      request.book.stock -= 1;
      await request.book.save();

      request.status = "approved";
      request.respondedAt = new Date();
    }

    // ---- REJECT ISSUE ----
    else if (status === "rejected") {
      if (request.status !== "pending") {
        return res.status(400).json({ message: "Only pending requests can be rejected", success: false });
      }
      request.status = "rejected";
      request.rejectionReason = rejectionReason || "Not specified";
      request.respondedAt = new Date();
    }

    // ---- APPROVE RETURN ----
    else if (status === "returned") {
      if (request.status !== "return_requested") {
        return res.status(400).json({ message: "Book must be return_requested before marking returned", success: false });
      }
      request.status = "returned";
      request.returnedAt = new Date();

      request.book.stock += 1;
      await request.book.save();
    }

    else {
      return res.status(400).json({ message: "Invalid status update", success: false });
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
    request.book.stock += 1;

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


