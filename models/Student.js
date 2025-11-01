const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    completedLessons: { type: Number, default: 0 }
  },
  { _id: false }
);

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    bio:{type:String},
    profilePic:{type:String},
    role: { type: String, default: 'student', enum: ['student'] },
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    progress: [progressSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);