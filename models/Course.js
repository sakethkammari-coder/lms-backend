const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({

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
},

videoUrl: {
type: String
},

lessons: [
{
type: String
}
]

});

module.exports = mongoose.model("Course", CourseSchema);
