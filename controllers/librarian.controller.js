   
const Librarian = require("../models/librarian.model");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

        let existing = await Librarian.find({ $or: [{ email }, { phone }] });
        if (existing.length > 0) {
            return res.status(400).json({ message: "Email or phone already exist", success: false });
        }

        if (phone.length !== 10) {
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

        delete newLibrarian._doc.password;

        return res.status(201).json({
            message: "Librarian Registration Successfully",
            success: true,
            librarian: newLibrarian
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
