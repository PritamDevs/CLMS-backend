const mongoose =require('mongoose')
const Student = require("../models/student.model")
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const IssueRequest = require("../models/issueRequest.model");
const Book = require("../models/book.model");
module.exports.login=async(req,res)=> {
   try{
    let{email,password}=req.body
    if(!email||!password){
        return res.status(400).json({message:"Email and password are required",success:false})
    }else{
        let student = await Student.findOne({email:email})
        if(!student){
            return res.status(400).json({message:"Invalid email",success:false})
        }else{
            let isValidPassword =await bcrypt.compare(password,student.password)
            if(!isValidPassword){
                return res.status(400).json({message:"Invalid Password",success:false})
            }else{
                delete student._doc.password

                let payload = {
                    name:student.name,
                    email:student.email,
                    phone:student.phone,
                    id:student._id,
                    type:"student"
                }
                let token = jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:'1h'})
                return res.status(200).json({message:"Login successful",success:true,token:token,buyer:payload})
            }
        }
    }

   }catch(err){
      return res.status(500).json({message:"Internal Server Error",success:false});
   }
}

module.exports.Register=async(req,res)=> {
    try{
        let{name,email,password,cpassword,phone}=req.body;
        if(!name|| !email || !password || !cpassword || !phone){
        return res.status(400).json({message:"Please fill all fields",status:false});
        }else if (password !== cpassword){
            return res.status(400).json({
                message:"Password and Confirm password are not same",success:false
            });
        }else {
            let student = await Student.find({$or: [{ email: email }, { phone: phone }]});
            if(student.length > 0){
                return res.status(400).json({message:"Email or phone already exist",success:false});
            }else{
                let hashedPassword = await bcrypt.hash(password,10)
                if(phone.length!==10){
                    return res.status(400).json({message:"Invalid Phone Number",success:false});
                }
                let newStudent = await Student.create({
                    name:name,
                    email:email,
                    password:hashedPassword,
                    phone:phone
                })
                delete newStudent._doc.password
                return res.status(201).json({message:"Student Registration Successfully",success:true,newStudent});
            }
        }
    }catch (err){
        console.error(err); 
        return res.status(500).json({message:"Internal Server Error",success:false});
    }
    }


    module.exports.Profile=async (req,res)=>{
        const bId=req.user.id
        try {
            let data=await Student.findById(bId)
            delete data._doc.password
            return res.send({message:"student profile",success:true,data})
        } catch (error) {
             return res.status(500).json({message:"Internal Server Error",success:false});
        }
    }

    module.exports.RequestBookIssue = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { bookId } = req.body;
        if (!bookId) return res.status(400).json({ message: "Book ID is required", success:false });

        const book = await Book.findById(bookId);
        if (!book) return res.status(404).json({ message: "Book not found", success:false });

        const existing = await IssueRequest.findOne({ student: studentId, book: bookId });
        if (existing) return res.status(400).json({ message: "You have already requested this book", success:false });

        const request = await IssueRequest.create({ student: studentId, book: bookId });
        res.status(201).json({ message: "Book request submitted", success:true, request });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", success:false });
    }
    };

    module.exports.MyRequests = async (req, res) => {
    try {
        const requests = await IssueRequest.find({ student: req.user.id }).populate("book");
        res.status(200).json({ message: "Your book requests", success:true, requests });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", success:false });
    }
};

// module.exports.RequestReturn = async (req, res) => {
//   try {
//     const { requestId } = req.body;

//     if (!requestId) {
//       return res.status(400).json({ message: "requestId is required", success: false });
//     }
//        if (!req.user?.id||!mongoose.Types.ObjectId.isValid(requestId)) {
//       return res.status(401).json({ message: "Invalid user Id", success: false });
//     }
//     const userId = new mongoose.Types.createFromHexString(req.user.id);
//     const request = await IssueRequest.findOne({
//       _id: requestId,
//       student: userId
//     });

//     if (!request) {
//       return res.status(404).json({ message: "Request not found", success: false });
//     }
//     if (!request.student.equals(req.user.id)) {
//       return res.status(403).json({ message: "You do not have permission for this request", success: false });
//     }

//     if (request.status !== "approved") {
//       return res.status(400).json({ message: "Only approved books can be requested for return", success: false });
//     }

//     request.status = "return_requested";
//     request.returnRequestedAt = new Date();
//     await request.save();

//     return res.status(200).json({
//       message: "Return request submitted successfully",
//       success: true,
//       request
//     });
//   } catch (err) {
//     console.error("RequestReturn error:", err);
//     return res.status(500).json({ message: "Internal Server Error", success: false });
//   }
// };
module.exports.RequestReturn = async (req, res) => {
  try {
    const { requestId } = req.body;

    if (!requestId) {
      return res.status(400).json({ message: "requestId is required", success: false });
    }

    if (!req.user?.id || !mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(401).json({ message: "Invalid user Id", success: false });
    }

    const userId = new mongoose.Types.ObjectId(req.user.id); 
    const request = await IssueRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: "Request not found", success: false });
    }
    if (!request.student.equals(userId)) {
      return res.status(403).json({ message: "You do not have permission for this request", success: false });
    }

    if (request.status !== "approved") {
      return res.status(400).json({ message: "Only approved books can be requested for return", success: false });
    }

    if (request.status === "return_requested") {
      return res.status(400).json({ message: "Return already requested for this book", success: false });
    }

    request.status = "return_requested";
    request.returnRequestedAt = new Date();
    await request.save();

    return res.status(200).json({
      message: "Return request submitted successfully",
      success: true,
      request
    });

  } catch (err) {
    console.error("RequestReturn error:", err);
    return res.status(500).json({ message: "Internal Server Error", success: false });
  }
};
