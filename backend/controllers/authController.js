// controllers/authController.js

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ==========================
// REGISTER USER
// ==========================
exports.registerUser = async (req, res) => {

    try {

        const {
            username,
            email,
            password,
            role,
        } = req.body;

        // ==========================
        // CHECK USER EXISTS
        // ==========================
        const userExists =
            await User.findOne({
                email,
            });

        if (userExists) {

            return res.json({
                success: false,
                message:
                    "User already exists",
            });

        }

        // ==========================
        // HASH PASSWORD
        // ==========================
        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );

        // ==========================
        // CREATE USER
        // ==========================
        const user =
            await User.create({

                username,

                email,

                password:
                    hashedPassword,

                role:
                    role || "user",

            });

        // ==========================
        // RESPONSE
        // ==========================
        res.json({

            success: true,

            message:
                "Registration Successful",

            user: {
                id: user._id,
                username:
                    user.username,
                email:
                    user.email,
                role:
                    user.role,
            },

        });

    } catch (error) {

        console.log(error);

        res.json({
            success: false,
            message:
                "Server Error",
        });

    }

};

// ==========================
// LOGIN USER
// ==========================
exports.loginUser = async (req, res) => {

    try {

        const {
            email,
            password,
        } = req.body;

        // ==========================
        // FIND USER
        // ==========================
        const user =
            await User.findOne({
                email,
            });

        if (!user) {

            return res.json({

                success: false,

                message:
                    "User not found",

            });

        }

        // ==========================
        // CHECK PASSWORD
        // ==========================
        const isMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!isMatch) {

            return res.json({

                success: false,

                message:
                    "Invalid password",

            });

        }

        // ==========================
        // CREATE TOKEN
        // ==========================
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,   // 🔥 MUST ADD THIS
            },
            "secretkey",
            { expiresIn: "7d" }
        );

        // ==========================
        // SUCCESS RESPONSE
        // ==========================
        res.json({

            success: true,

            message:
                "Login Successful",

            token,

            user: {

                id:
                    user._id,

                username:
                    user.username,

                email:
                    user.email,

                role:
                    user.role, // IMPORTANT

            },

        });

    } catch (error) {

        console.log(error);

        res.json({

            success: false,

            message:
                "Server Error",

        });

    }

};