import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, phone, email, password, name } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const computedName = name || [firstName, lastName].filter(Boolean).join(" ");

    const user = new User({
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      phone: phone || undefined,
      name: computedName || undefined,
      email,
      password: hashedPassword,
      cart: [],
      wishlist: []
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({ 
      token,
      user: {
        id: user._id,
        name: computedName,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error });
  }
});

// Signin
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email })
      .populate('cart.productId')
      .populate('wishlist');

    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const displayName = user.name || [user.firstName, user.lastName].filter(Boolean).join(" ");

    res.json({
      token,
      user: {
        id: user._id,
        name: displayName,
        email: user.email,
        isAdmin: user.isAdmin || false,
        cart: user.cart,
        wishlist: user.wishlist
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
});

// Get current user info
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("name email firstName lastName cart wishlist isAdmin")
      .populate('cart.productId')
      .populate('wishlist');

    if (!user) return res.status(404).json({ message: "User not found" });

    const displayName = user.name || [user.firstName, user.lastName].filter(Boolean).join(" ");
    
    res.json({
      id: user._id,
      name: displayName,
      email: user.email,
      isAdmin: user.isAdmin || false,
      cart: user.cart,
      wishlist: user.wishlist
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error });
  }
});
export default router;
