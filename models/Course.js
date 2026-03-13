const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({

  title: String,
  instructor: String,
  duration: String,
  level: String,

  thumbnail: String,

  description: String,

  content: String,

  videoUrl: String,

  lessons: [
    String
  ]

});

module.exports = mongoose.model("Course", CourseSchema);