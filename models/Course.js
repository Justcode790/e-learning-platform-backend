const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    videoUrl: { type: String, default: '' },
    duration: { type: Number, default: 0 },
    description: { type: String, default: '' }
  },
  { _id: false }
);

const feedbackSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, default: '' },
    date: { type: Date, default: Date.now }
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'General' },
    thumbnailUrl:{type:String},
    price: { type: Number, default: 0 },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    lessons: [lessonSchema],
    studentsEnrolled: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    feedback: [feedbackSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);