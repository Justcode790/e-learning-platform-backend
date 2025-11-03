const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    videoUrl: { type: String, required:true, default: '' },
    duration: { type: Number, default: 0 },
    description: { type: String, default: '' },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course'}
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lesson', lessonSchema);