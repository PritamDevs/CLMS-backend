

const jwt = require('jsonwebtoken');

module.exports.auth = (types) => async (req, res, next) => {
    try {
        let token = req.header('Authorization');

        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.', success: false });
        }

        if (token.startsWith('Bearer ')) {
            token = token.slice(7).trim();
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log("Decoded token in auth:", decoded);
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expired. Please login again.', success: false });
            }
            return res.status(401).json({ message: 'Invalid token.', success: false });
        }

        if (!types.includes(decoded.type)) {
        console.warn(` Unauthorized access attempt by ${decoded.type}`);
        return res.status(403).json({ message: 'Access denied. You do not have permission.', success: false });
    }

        req.user = decoded;
        next();

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error', success: false });
    }
};
