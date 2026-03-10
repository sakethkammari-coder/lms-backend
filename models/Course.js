const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({

  id: {
    type: String,
    required: true
  },

  title: {
    type: String,
    required: true
  },

  instructor: {
    type: String,
    required: true
  },

  duration: {
    type: String
  },

  level: {
    type: String
  },

  thumbnail: {
    type: String
  },

  description: {
    type: String
  },

  content: {
    type: String
  }

});

module.exports = mongoose.model("Course", CourseSchema);