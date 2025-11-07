import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const makeAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Update user to admin
    const email = "upadhyesmiti1010@gmail.com";
    const result = await User.updateOne(
      { email: email },
      { $set: { isAdmin: true } }
    );

    if (result.matchedCount === 0) {
      console.log(`❌ User with email ${email} not found`);
    } else if (result.modifiedCount === 0) {
      console.log(`ℹ️  User ${email} is already an admin`);
    } else {
      console.log(`✅ Successfully made ${email} an admin!`);
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

makeAdmin();

