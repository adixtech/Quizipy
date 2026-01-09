import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });


// Get JWT secret from environment (do NOT hardcode)
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error('❌ JWT_SECRET environment variable is not set');
}

/**
 * User Registration
 * POST /api/auth/register
 */
export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ 
                message: 'Please provide all required fields' 
            });
        }

        // Validate role
        if (!role || !['student', 'teacher'].includes(role)) {
            return res.status(400).json({ 
                message: "Invalid role. Must be 'student' or 'teacher'." 
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                message: 'User already exists with this email' 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role
        });

        await newUser.save();
        console.log("✅ User Registered:", email, "Role:", role);

        // Success response (don't send password back)
        res.status(201).json({
            message: 'Registration successful',
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error('❌ Registration Error:', error);
        res.status(500).json({
            message: 'Server error during registration',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * User Login
 * POST /api/auth/login
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate inputs
        if (!email || !password) {
            return res.status(400).json({
                message: 'Please provide both email and password'
            });
        }

        console.log("🔍 Login Attempt:", email);

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            console.log("❌ User not found:", email);
            return res.status(401).json({ 
                message: 'Invalid credentials' 
            });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("❌ Invalid password for:", email);
            return res.status(401).json({ 
                message: 'Invalid credentials' 
            });
        }

        // Ensure JWT_SECRET is available
        if (!JWT_SECRET) {
            console.error('❌ JWT_SECRET not configured');
            return res.status(500).json({
                message: 'Server configuration error'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user._id,
                role: user.role 
            },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log("✅ Login successful:", email);

        // Send response (exclude password)
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("❌ Login Error:", error);
        res.status(500).json({
            message: 'Server error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Verify Token
 * GET /api/auth/verify
 */
export const verifyToken = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ 
                message: 'No token provided' 
            });
        }

        if (!JWT_SECRET) {
            return res.status(500).json({ 
                message: 'Server configuration error' 
            });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Get user (exclude password)
        const user = await User.findById(decoded.id)
            .select('-password')
            .lean();

        if (!user) {
            return res.status(401).json({ 
                message: 'User not found' 
            });
        }

        res.json({ user });
    } catch (error) {
        console.error('❌ Token Verification Error:', error);
        res.status(401).json({
            message: 'Invalid or expired token',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// /**
//  * Change Password
//  * POST /api/auth/change-password
//  */
// export const changePassword = async (req, res) => {
//     try {
//         const { currentPassword, newPassword } = req.body;
//         const userId = req.user.id; // From auth middleware

//         if (!currentPassword || !newPassword) {
//             return res.status(400).json({
//                 message: 'Please provide both current and new password'
//             });
//         }

//         const user = await User.findById(userId);
//         if (!user) {
//             return res.status(404).json({
//                 message: 'User not found'
//             });
//         }

//         // Verify current password
//         const isMatch = await bcrypt.compare(currentPassword, user.password);
//         if (!isMatch) {
//             return res.status(401).json({
//                 message: 'Current password is incorrect'
//             });
//         }

//         // Hash new password
//         const hashedPassword = await bcrypt.hash(newPassword, 12);
//         user.password = hashedPassword;
//         await user.save();

//         res.json({
//             message: 'Password updated successfully'
//         });
//     } catch (error) {
//         console.error('❌ Password Change Error:', error);
//         res.status(500).json({
//             message: 'Server error while changing password',
//             error: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// };