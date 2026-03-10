const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Course = require("./models/Course");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());


// Test route
app.get("/", (req, res) => {
  res.send("Backend server is running");
});


// Test API
app.get("/api/message", (req, res) => {
  res.json({ message: "Hello from backend" });
});


// 👇 ADD THIS ROUTE HERE
app.get("/api/courses", async (req, res) => {
  try {

    const courses = await Course.find();

    res.json(courses);

  } catch (error) {

    console.log("MongoDB Error:", error); // prints real error in terminal
    res.status(500).json({ message: "Error fetching courses" });

  }
});


// MongoDB connection
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.log(err));


const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});