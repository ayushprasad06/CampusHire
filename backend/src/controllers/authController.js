import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // Find user
        const user = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Compare password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Create JWT
        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        return res.status(200).json({
            message: "Login successful",

            token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                cgpa: user.cgpa,
                graduationYear: user.graduationYear,
                resumeLink: user.resumeLink
            }
        });
    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Server error during login"
        });
    }
};

// ==========================================
// REGISTER
// ==========================================

export const register = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            role
        } = req.body;

        // -------------------------------
        // Validate required fields
        // -------------------------------

        if (!name || !email || !password || !role) {
            return res.status(400).json({
                message:
                    "Name, email, password and role are required"
            });
        }

        // -------------------------------
        // Admin registration is forbidden
        // -------------------------------

        if (!["STUDENT", "RECRUITER"].includes(role)) {
            return res.status(400).json({
                message:
                    "Only Student and Recruiter accounts can be registered"
            });
        }

        // -------------------------------
        // Check existing email
        // -------------------------------

        const existingUser = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (existingUser) {
            return res.status(409).json({
                message:
                    "An account with this email already exists"
            });
        }

        // -------------------------------
        // Hash password
        // -------------------------------

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        // -------------------------------
        // Create user
        // -------------------------------

        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role,

            // Student profile information will
            // be completed after registration.
            department: null,
            cgpa: null,
            graduationYear: null,
            resumeLink: null
        });

        // -------------------------------
        // Response
        // -------------------------------

        return res.status(201).json({
            message: "Account created successfully",

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                cgpa: user.cgpa,
                graduationYear: user.graduationYear,
                resumeLink: user.resumeLink
            }
        });
    } catch (error) {
        console.error("Registration error:", error);

        return res.status(500).json({
            message:
                "Server error during registration"
        });
    }
};