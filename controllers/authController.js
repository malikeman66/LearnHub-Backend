const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const createToken = (user) => {

  return jwt.sign(
    {
      id: user._id,
      role: user.role
    },

    process.env.JWT_SECRET,

    {
      expiresIn: "7d"
    }
  );
};


// REGISTER
const register = async (req, res) => {

  try {

    const {
      name,
      email,
      password,
      role
    } = req.body;


    if (!name || !email || !password) {

      return res.status(400).json({
        message: "Name, email and password are required."
      });

    }


    if (password.length < 6) {

      return res.status(400).json({
        message: "Password must be at least 6 characters."
      });

    }


    const existingUser = await User.findOne({
      email: email.toLowerCase()
    });


    if (existingUser) {

      return res.status(409).json({
        message: "An account with this email already exists."
      });

    }


    // Admin cannot be created from public registration.
    const selectedRole =
      ["Student", "Instructor"].includes(role)
        ? role
        : "Student";


    const hashedPassword =
      await bcrypt.hash(password, 10);


    const user = await User.create({

      name,

      email: email.toLowerCase(),

      password: hashedPassword,

      role: selectedRole

    });


    const token = createToken(user);


    res.status(201).json({

      message: "Registration successful.",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }

    });


  } catch (error) {

    res.status(500).json({

      message: "Registration failed.",

      error: error.message

    });

  }
};


// LOGIN
const login = async (req, res) => {

  try {

    const {
      email,
      password
    } = req.body;


    const user = await User.findOne({
      email: email?.toLowerCase()
    });


    if (!user) {

      return res.status(401).json({
        message: "Invalid email or password."
      });

    }


    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );


    if (!passwordMatch) {

      return res.status(401).json({
        message: "Invalid email or password."
      });

    }


    const token = createToken(user);


    res.json({

      message: "Login successful.",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }

    });


  } catch (error) {

    res.status(500).json({

      message: "Login failed.",

      error: error.message

    });

  }
};


module.exports = {
  register,
  login
};