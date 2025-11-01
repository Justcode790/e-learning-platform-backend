const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    bio: { type: String, default: 'Passionate about making high-quality education accessible to everyone' },
    profilePic: { type: String, default: './imagepart1.png' },
    role: { type: String, default: 'teacher', enum: ['teacher'] },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Teacher', teacherSchema);