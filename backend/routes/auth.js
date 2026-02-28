const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

// Birthday MM/DD/YYYY → username "MMDD"
const birthdayToUsername = (birthday) => {
  const parts = birthday.split("/");
  if (parts.length !== 3) return null;
  return `${parts[0].padStart(2, "0")}${parts[1].padStart(2, "0")}`;
};

// Validate MM/DD/YYYY format
const isValidBirthday = (birthday) => {
  return /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/.test(birthday);
};

// ─────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────
router.post("/register", async (req, res) => {
  const {
    fullName,
    userId,
    birthday,
    role,
    course,
    section,
    college,
    department,
    schoolYear,
  } = req.body;

  try {
    if (!fullName || !userId || !birthday || !role)
      return res
        .status(400)
        .json({ message: "Full name, ID, birthday, and role are required" });

    if (!["student", "instructor"].includes(role))
      return res.status(400).json({ message: "Invalid role" });

    if (!isValidBirthday(birthday))
      return res
        .status(400)
        .json({ message: "Birthday must be in MM/DD/YYYY format" });

    if (!college || !department || !schoolYear)
      return res
        .status(400)
        .json({ message: "College, department, and school year are required" });

    if (role === "student" && (!course || !section))
      return res
        .status(400)
        .json({ message: "Course and section are required for students" });

    // Block admin ID
    if (userId === process.env.ADMIN_ID)
      return res.status(400).json({ message: "This ID is reserved" });

    const existing = await User.findOne({ userId });
    if (existing)
      return res.status(400).json({ message: "This ID is already registered" });

    // Auto-generate username from birthday
    const username = birthdayToUsername(birthday);
    if (!username)
      return res.status(400).json({ message: "Invalid birthday format" });

    // Password = their ID (hashed by pre-save hook)
    const user = await User.create({
      fullName,
      username,
      userId,
      password: userId,
      birthday,
      role,
      college,
      department,
      schoolYear,
      course: role === "student" ? course : null,
      section: role === "student" ? section : null,
    });

    const token = generateToken({ id: user._id, role: user.role });

    res.status(201).json({
      message: "Registration Successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        userId: user.userId,
        role: user.role,
        course: user.course,
        section: user.section,
        college: user.college,
        department: user.department,
        schoolYear: user.schoolYear,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// ─────────────────────────────────────────
// POST /api/auth/login
// Username = MMDD, Password = their ID
// ─────────────────────────────────────────
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password)
      return res
        .status(400)
        .json({ message: "Please provide username and password" });

    // ── Hard-coded Admin ──
    if (
      username === process.env.ADMIN_USERNAME &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = generateToken({
        username: process.env.ADMIN_USERNAME,
        role: "admin",
      });
      return res.json({
        message: "Login Successful",
        token,
        user: {
          id: "admin",
          fullName: "System Admin",
          username: process.env.ADMIN_USERNAME,
          role: "admin",
        },
      });
    }

    // ── Find by username (MMDD) — may match multiple users ──
    const users = await User.find({ username, isActive: true });
    if (!users || users.length === 0)
      return res.status(401).json({ message: "Invalid username or password" });

    // Find the one whose password matches
    let matchedUser = null;
    for (const u of users) {
      const isMatch = await u.matchPassword(password);
      if (isMatch) {
        matchedUser = u;
        break;
      }
    }

    if (!matchedUser)
      return res.status(401).json({ message: "Invalid username or password" });

    const token = generateToken({
      id: matchedUser._id,
      role: matchedUser.role,
    });

    res.json({
      message: "Login Successful",
      token,
      user: {
        id: matchedUser._id,
        fullName: matchedUser.fullName,
        username: matchedUser.username,
        userId: matchedUser.userId,
        role: matchedUser.role,
        course: matchedUser.course,
        section: matchedUser.section,
        college: matchedUser.college,
        department: matchedUser.department,
        schoolYear: matchedUser.schoolYear,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

module.exports = router;
