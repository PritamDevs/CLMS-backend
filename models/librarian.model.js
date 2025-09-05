const mongoose=require('mongoose');
const {Schema} = mongoose;

let librarianSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        min: 8,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
    },
    college_id: {
        type: String,
        required: true,
    },
    books: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Books'
        }
    ]
});
module.exports = mongoose.model('Librarian',librarianSchema);