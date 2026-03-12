const mongoose = require("mongoose");

const EnrollmentSchema = new mongoose.Schema({

userId: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
required: true
},

courseId: {
type: mongoose.Schema.Types.ObjectId,
ref: "Course",
required: true
},

enrolledAt: {
type: Date,
default: Date.now
}

});

// Prevent duplicate enrollments for same user and course
EnrollmentSchema.index(
{ userId: 1, courseId: 1 },
{ unique: true }
);

module.exports = mongoose.model("Enrollment", EnrollmentSchema);
