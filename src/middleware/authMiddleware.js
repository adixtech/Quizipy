import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });  // ✅ FIX


const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // ✅ Get token from header

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized - No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // ✅ Verify token
        req.user = decoded; // ✅ Attach user data to request
        next(); // ✅ Move to next middleware
    } catch (error) {
        return res.status(403).json({ message: 'Forbidden - Invalid token' });
    }
};

export default authMiddleware;
