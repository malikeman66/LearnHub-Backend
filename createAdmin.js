require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const connectDB = require("./config/db");
const User = require("./models/User");

const createAdmin = async () => {
  const password = process.env.ADMIN_PASSWORD;

  if (!password || !password.trim()) {
    console.error(
      "ADMIN_PASSWORD is required. Set it in backend/.env before running npm run create-admin."
    );
    process.exit(1);
  }

  try {
    await connectDB();

    const name = (process.env.ADMIN_NAME || "LearnHub Admin").trim();

    const email = (process.env.ADMIN_EMAIL || "admin@learnhub.com")
      .trim()
      .toLowerCase();

    const existingAdmin = await User.findOne({
      email
    });

    if (existingAdmin) {
      if (existingAdmin.role !== "Admin") {
        throw new Error(
          "A non-admin account already uses ADMIN_EMAIL. Choose an email not assigned to another user."
        );
      }

      let adminChanged = false;

      if (existingAdmin.name !== name) {
        existingAdmin.name = name;
        adminChanged = true;
      }

      const passwordMatches = await bcrypt.compare(
        password,
        existingAdmin.password
      );

      if (!passwordMatches) {
        existingAdmin.password = await bcrypt.hash(password, 10);
        adminChanged = true;
      }

      if (adminChanged) {
        await existingAdmin.save();
      }

      console.log("Admin account ready.");
      await mongoose.connection.close();
      return;
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: "Admin"
    });

    console.log("Admin account created.");
    console.log(`Email: ${email}`);

    await mongoose.connection.close();

    process.exit(0);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

createAdmin();