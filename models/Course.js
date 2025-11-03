const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'General' },
    thumbnailUrl: { type: String, required: true },
    price: { type: Number, default: 0 },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
    studentsEnrolled: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    feedback: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Feedback' }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);
