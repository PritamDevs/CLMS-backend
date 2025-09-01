
const mongoose=require('mongoose');
const { Schema } = mongoose;

let bookSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    isbn: {
        type: String,
        required: true,
        unique: true,
    },
    publisher: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        enum: ['Collegesubject', 'Fiction', 'Non-Fiction', 'Kids','Self-help','SyllabusBooks','Others'],
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    copiesAvailable: {
        type: Number,
        default: 1,
    },
    publishedyear: {
        type: Number,
    }
});
module.exports = mongoose.model('Book',bookSchema);