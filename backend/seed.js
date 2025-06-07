import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/user.model.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const exists = await User.findOne({ email: "admin@ilnb.co.in" });

    if (!exists) {
      const admin = new User({
        username: "Admin User",
        email: "admin@ilnb.co.in",
        password: await bcrypt.hash("Admin@123", 9),
        role: "top_management"
      });

      await admin.save();
      console.log("Top Management user seeded ");
    } 

    process.exit();
  } catch (err) {
    console.error("Seeding failed ", err);
    process.exit(1);
  }
};

seedAdmin();
