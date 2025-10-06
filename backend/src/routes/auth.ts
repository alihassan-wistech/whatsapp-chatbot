import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { query } from "../db";

const router = express.Router();

// ============================================
// SIGNUP - Create new user account
// ============================================
router.post("/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    // Check if user already exists
    const existingUsers = await query("SELECT id FROM users WHERE email = ?", [
      email,
    ]);

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return res.status(400).json({
        error: "Email already registered",
      });
    }

    // Hash password (never store plain passwords!)
    // bcrypt is slow on purpose - makes hacking harder
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user into database
    const result: any = await query(
      "INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)",
      [email, passwordHash, name || null]
    );

    // Return success
    res.status(201).json({
      message: "User created successfully",
      userId: result.insertId,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Signup failed" });
  }
});

// ============================================
// LOGIN - Authenticate user
// ============================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    // Find user by email
    const users = await query(
      "SELECT id, email, password_hash, name FROM users WHERE email = ?",
      [email]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const user: any = users[0];

    // Check password
    const passwordValid = await bcrypt.compare(password, user.password_hash);

    if (!passwordValid) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    // Create JWT token
    // This token proves the user is authenticated
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" } // Token expires in 7 days
    );

    // Return token and user info
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

export default router;
