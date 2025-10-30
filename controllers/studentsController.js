const Student = require('../models/Student');
const Course = require('../models/Course');

async function getStudentById(req, res, next) {
  try {
    const student = await Student.findById(req.params.id)
      .select('-password')
      .populate({ path: 'enrolledCourses', select: 'title category price lessons' });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    next(err);
  }
}

async function updateStudent(req, res, next) {
  try {
    if (req.user.id !== req.params.id) return res.status(403).json({ message: 'Forbidden' });
    const { name } = req.body;
    const updated = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: { name } },
      { new: true }
    ).select('-password');
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function enrollInCourse(req, res, next) {
  try {
    const { id, courseId } = req.params;
    if (req.user.id !== id) return res.status(403).json({ message: 'Forbidden' });

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    if (!student.enrolledCourses.includes(courseId)) {
      student.enrolledCourses.push(courseId);
      student.progress.push({ courseId, completedLessons: 0 });
      await student.save();
    }

    if (!course.studentsEnrolled.includes(id)) {
      course.studentsEnrolled.push(id);
      await course.save();
    }

    res.json({ message: 'Enrolled successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getStudentById, updateStudent, enrollInCourse };