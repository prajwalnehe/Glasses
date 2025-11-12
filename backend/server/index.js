import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Import routes
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import contactLensRoutes from "./routes/contactLensRoutes.js";
import allProductsRoutes from "./routes/allProductsRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables (from backend/.env)
dotenv.config({ path: path.join(__dirname, "..", ".env") });

// Check for required environment variables
const requiredEnv = ["MONGO_URI", "JWT_SECRET", "RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"];
requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing ${key} in backend/.env`);
    process.exit(1);
  }
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Routes
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", uploadRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/contact-lenses", contactLensRoutes);
app.use("/api/all-products", allProductsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

// Serve React frontend (for Render or production)
const frontendPath = path.resolve(__dirname, "../../frontend/build");
app.use(express.static(frontendPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!", error: err.message });
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌍 Health check: http://localhost:${PORT}/health`);
});
