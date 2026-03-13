const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const Course = require("./models/Course");
const User = require("./models/User");
const Enrollment = require("./models/Enrollment");
const adminOnly = require("./middleware/admin");

const app = express();

app.use(cors());
app.use(express.json());

const SECRET_KEY = process.env.JWT_SECRET || "MY_SECRET_KEY";

app.get("/", (req, res) => {
res.send("Backend server is running");
});

// ========================
// AUTH MIDDLEWARE
// ========================
function authenticateToken(req, res, next) {

const authHeader = req.headers.authorization;

if (!authHeader) {
return res.status(401).json({ message: "Access denied" });
}

const token = authHeader.split(" ")[1];

try {


const verified = jwt.verify(token, SECRET_KEY);
req.user = verified;

next();


} catch (error) {


res.status(400).json({ message: "Invalid token" });


}

}

// ========================
// COURSE APIs
// ========================

app.get("/api/courses", async (req, res) => {

try {


const courses = await Course.find();
res.json(courses);


} catch (error) {


console.log(error);
res.status(500).json({ message: "Error fetching courses" });


}

});

app.get("/api/courses/:id", async (req, res) => {

try {


const course = await Course.findById(req.params.id);

if (!course) {
  return res.status(404).json({ message: "Course not found" });
}

res.json(course);


} catch (error) {


console.log(error);
res.status(500).json({ message: "Error fetching course" });


}

});

// ========================
// AUTH APIs
// ========================

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
  {
    id: user._id,
    email: user.email,
    role: user.role
  },
  SECRET_KEY,
  { expiresIn: "1d" }
);

res.json({
  token,
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  }
});


} catch (error) {


console.log(error);
res.status(500).json({ message: "Login error" });


}

});

// ========================
// ENROLLMENT APIs
// ========================

app.post("/api/enroll", authenticateToken, async (req, res) => {

try {


const userId = req.user.id;
const { courseId } = req.body;

const existing = await Enrollment.findOne({
  userId,
  courseId
});

if (existing) {
  return res.json({ message: "Already enrolled" });
}

const enrollment = new Enrollment({
  userId,
  courseId
});

await enrollment.save();

res.json({ message: "Enrollment successful" });


} catch (error) {


console.log(error);
res.status(500).json({ message: "Enrollment error" });


}

});

app.get("/api/my-courses", authenticateToken, async (req, res) => {

try {


const enrollments = await Enrollment
  .find({ userId: req.user.id })
  .populate("courseId");

const courses = enrollments.map(e => e.courseId);

res.json(courses);


} catch (error) {


console.log(error);
res.status(500).json({ message: "Error fetching enrolled courses" });


}

});

// ========================
// ADMIN APIs
// ========================

app.get("/api/admin/users", authenticateToken, adminOnly, async (req, res) => {

try {


const users = await User.find().select("-password");

res.json(users);


} catch (error) {


res.status(500).json({ message: "Error fetching users" });


}

});

app.post("/api/admin/course", authenticateToken, adminOnly, async (req, res) => {

try {


const course = new Course(req.body);
await course.save();

res.json({ message: "Course added successfully" });


} catch (error) {


res.status(500).json({ message: "Error adding course" });


}

});

app.put("/api/admin/course/:id", authenticateToken, adminOnly, async (req, res) => {

try {


await Course.findByIdAndUpdate(req.params.id, req.body);

res.json({ message: "Course updated" });


} catch (error) {


res.status(500).json({ message: "Update failed" });


}

});

app.delete("/api/admin/course/:id", authenticateToken, adminOnly, async (req, res) => {

try {


await Course.findByIdAndDelete(req.params.id);

res.json({ message: "Course deleted" });


} catch (error) {


res.status(500).json({ message: "Delete failed" });


}

});

app.delete("/api/admin/user/:id", authenticateToken, adminOnly, async (req, res) => {

try {


await User.findByIdAndDelete(req.params.id);

res.json({ message: "User removed" });


} catch (error) {


res.status(500).json({ message: "Error deleting user" });


}

});

// ========================
// DATABASE
// ========================

mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.log(err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`);
});
