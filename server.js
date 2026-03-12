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

const SECRET_KEY = process.env.JWT_SECRET || "MY_SECRET_KEY";

// Root route
app.get("/", (req, res) => {
res.send("Backend server is running");
});

// Get all courses
app.get("/api/courses", async (req, res) => {

try {

```
const courses = await Course.find();

res.json(courses);
```

} catch (error) {

```
console.log(error);

res.status(500).json({
  message: "Error fetching courses"
});
```

}

});

// Get single course
app.get("/api/courses/:id", async (req, res) => {

try {

```
const course = await Course.findById(req.params.id);

if (!course) {
  return res.status(404).json({
    message: "Course not found"
  });
}

res.json(course);
```

} catch (error) {

```
console.log(error);

res.status(500).json({
  message: "Error fetching course"
});
```

}

});

// Signup
app.post("/api/signup", async (req, res) => {

try {

```
const { name, email, password } = req.body;

const existingUser = await User.findOne({ email });

if (existingUser) {
  return res.status(400).json({
    message: "User already exists"
  });
}

const hashedPassword = await bcrypt.hash(password, 10);

const newUser = new User({
  name,
  email,
  password: hashedPassword
});

await newUser.save();

res.json({
  message: "Signup successful"
});
```

} catch (error) {

```
console.log(error);

res.status(500).json({
  message: "Signup error"
});
```

}

});

// Login
app.post("/api/login", async (req, res) => {

try {

```
const { email, password } = req.body;

const user = await User.findOne({ email });

if (!user) {
  return res.status(404).json({
    message: "User not found"
  });
}

const validPassword = await bcrypt.compare(password, user.password);

if (!validPassword) {
  return res.status(401).json({
    message: "Incorrect password"
  });
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
```

} catch (error) {

```
console.log(error);

res.status(500).json({
  message: "Login error"
});
```

}

});

// JWT middleware
function authenticateToken(req, res, next) {

const authHeader = req.headers.authorization;

if (!authHeader) {
return res.status(401).json({
message: "Access denied"
});
}

const token = authHeader.split(" ")[1];

try {


const verified = jwt.verify(token, SECRET_KEY);

req.user = verified;

next();


} catch (error) {


res.status(400).json({
  message: "Invalid token"
});


}

}

// Enroll API
app.post("/api/enroll", authenticateToken, async (req, res) => {

try {


const userId = req.user.id;
const { courseId } = req.body;

const courseObjectId = new mongoose.Types.ObjectId(courseId);

const existing = await Enrollment.findOne({
  userId,
  courseId: courseObjectId
});

if (existing) {
  return res.json({
    message: "Already enrolled"
  });
}

const enrollment = new Enrollment({
  userId,
  courseId: courseObjectId
});

await enrollment.save();

res.json({
  message: "Enrollment successful"
});


} catch (error) {


console.log("Enroll Error:", error);

res.status(500).json({
  message: "Enrollment error"
});


}

});

// Get user's enrolled courses
app.get("/api/my-courses", authenticateToken, async (req, res) => {

try {


const userId = req.user.id;

const enrollments = await Enrollment
  .find({ userId })
  .populate("courseId");

const courses = enrollments.map(e => e.courseId);

res.json(courses);


} catch (error) {


console.log(error);

res.status(500).json({
  message: "Error fetching enrolled courses"
});


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
