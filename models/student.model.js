const mongoose=require('mongoose');
const { Schema } = mongoose;

const studentSchema = new Schema({
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
    address: {
        type: String,
    },
    books:[{
            type: Schema.Types.ObjectId,
            ref: 'Books',
        }],
    
    isSuspended: {
    type: Boolean,
    default: false
    },
    suspendedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Librarian',
    default: null
    },
    suspensionReason: {
    type: String,
    default: ''
    },
    suspendedAt: {
    type: Date,
    default: null
    }


});

module.exports = mongoose.model('Student',studentSchema);
