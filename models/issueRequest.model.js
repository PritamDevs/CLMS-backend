const mongoose = require("mongoose");

const issueRequestSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", 
    required: true, 
    },
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", 
    required: true ,
    },
    status: { 
        type: String, 
        enum: ["pending", "approved", "rejected","return_requested","returned"], 
        default: "pending" ,
    },
    requestedAt: { 
        type: Date, 
        default: Date.now ,
    },
    respondedAt: {
        type: Date
    },
    returnedAt:{
        type:Date
    },
    rejectionReason: {
        type: String
    }
});

module.exports = mongoose.model("issueRequest", issueRequestSchema);
