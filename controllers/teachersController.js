const Teacher = require('../models/Teacher');
const Course = require('../models/Course');

async function getAllTeachers(req, res, next) {
  try {
    const teachers = await Teacher.find().select('-password');
    res.json(teachers);
  } catch (err) {
    next(err);
  }
}

async function getTeacherById(req, res, next) {
  try {
    const teacher = await Teacher.findById(req.params.id).select('-password').populate({
      path: 'courses',
      select: 'title category price'
    });
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    res.json(teacher);
  } catch (err) {
    next(err);
  }
}

async function updateTeacher(req, res, next) {
  try {
    if (req.user.id !== req.params.id) return res.status(403).json({ message: 'Forbidden' });
    const { name, bio, profilePic } = req.body;
    const updated = await Teacher.findByIdAndUpdate(
      req.params.id,
      { $set: { name, bio, profilePic } },
      { new: true }
    ).select('-password');
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllTeachers, getTeacherById, updateTeacher };