const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const Course = require("./models/Course");
const User = require("./models/User");
const Enrollment = require("./models/Enrollment");

const app = express();

app.use(cors());
app.use(express.json());

const SECRET_KEY = "MY_SECRET_KEY";


// Test route
app.get("/", (req, res) => {
  res.send("Backend server is running");
});


// Test API
app.get("/api/message", (req, res) => {
  res.json({ message: "Hello from backend" });
});


// Get all courses
app.get("/api/courses", async (req, res) => {
  try {

    const courses = await Course.find();

    res.json(courses);

  } catch (error) {

    console.log(error);
    res.status(500).json({ message: "Error fetching courses" });

  }
});


// Signup API
app.post("/api/signup", async (req, res) => {

  try {

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    await newUser.save();

    res.json({ message: "Signup successful" });

  } catch (error) {

    console.log(error);
    res.status(500).json({ message: "Signup error" });

  }

});


// Login API
app.post("/api/login", async (req, res) => {

  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      SECRET_KEY,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {

    console.log(error);
    res.status(500).json({ message: "Login error" });

  }

});


// JWT middleware
function authenticateToken(req, res, next) {

  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "Access denied" });
  }

  try {

    const verified = jwt.verify(token, SECRET_KEY);

    req.user = verified;

    next();

  } catch (error) {

    res.status(400).json({ message: "Invalid token" });

  }

}


// Protected enroll API
app.post("/api/enroll", authenticateToken, async (req, res) => {

  const userId = req.user.id;
  const { courseId } = req.body;

  res.json({
    message: "Enrollment successful",
    userId,
    courseId
  });

});


// MongoDB connection
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.log(err));


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});