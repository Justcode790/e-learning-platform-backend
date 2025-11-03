const Student = require('../models/Student');
const Course = require('../models/Course');

// ===========================
// Get Student by ID
// ===========================
async function getStudentById(req, res, next) {
  try {
    const student = await Student.findById(req.params.id)
      .select('-password')
      .populate({
        path: 'enrolledCourses',
        select: 'title category price lessons thumbnailUrl',
      });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, student });
  } catch (err) {
    console.error('Error fetching student:', err);
    next(err);
  }
}

// ===========================
// Update Student (name, etc.)
// ===========================
async function updateStudent(req, res, next) {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const { name } = req.body;
    const updated = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: { name } },
      { new: true }
    ).select('-password');

    res.json({ success: true, student: updated });
  } catch (err) {
    console.error('Error updating student:', err);
    next(err);
  }
}

// ===========================
// Enroll in Course
// ===========================
// controllers/studentsController.js
async function enrollInCourse(req, res, next) {
  try {
    const userId = req.user.id; // from JWT
    const { id } = req.params;  // course ID

    console.log('Authenticated student:', userId);
    console.log('Course to enroll:', id);

    const course = await Course.findById(id);
    if (!course)
      return res.status(404).json({ success: false, message: 'Course not found' });

    const student = await Student.findById(userId);
    if (!student)
      return res.status(404).json({ success: false, message: 'Student not found' });

    // --- Enroll the student if not already ---
    if (!student.enrolledCourses.includes(id)) {
      student.enrolledCourses.push(id);
      student.progress.push({ courseId: id, completedLessons: 0 }); // ✅ matches your schema
      await student.save();
    }

    // --- Add student to course list if not already ---
    if (!course.studentsEnrolled.includes(userId)) {
      course.studentsEnrolled.push(userId);
      await course.save();
    }

    res.json({ success: true, message: 'Enrolled successfully' });
  } catch (err) {
    console.error('Error enrolling in course:', err);
    next(err);
  }
}

// ===========================
// Wishlist Handlers
// ===========================
async function addToWishlist(req, res, next) {
  try {
    const { id, courseId } = req.params; // student id, course id
    if (req.user.id !== id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const course = await Course.findById(courseId).select('_id');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const updated = await Student.findByIdAndUpdate(
      id,
      { $addToSet: { wishlist: courseId } },
      { new: true }
    ).select('-password');

    res.json({ success: true, wishlist: updated.wishlist });
  } catch (err) {
    console.error('Error adding to wishlist:', err);
    next(err);
  }
}

async function removeFromWishlist(req, res, next) {
  try {
    const { id, courseId } = req.params;
    if (req.user.id !== id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const updated = await Student.findByIdAndUpdate(
      id,
      { $pull: { wishlist: courseId } },
      { new: true }
    ).select('-password');

    res.json({ success: true, wishlist: updated.wishlist });
  } catch (err) {
    console.error('Error removing from wishlist:', err);
    next(err);
  }
}

async function getWishlist(req, res, next) {
  try {
    const { id } = req.params;
    console.log("getwishlist data: "+id)
    if (req.user.id !== id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const student = await Student.findById(id)
      .select('wishlist')
      .populate({ path: 'wishlist', select: 'title category price instructor thumbnailUrl', populate: { path: 'instructor', select: 'name' } });

    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    res.json({ success: true, wishlist: student.wishlist });
  } catch (err) {
    console.error('Error fetching wishlist:', err);
    next(err);
  }
}

module.exports = { getStudentById, updateStudent, enrollInCourse, addToWishlist, removeFromWishlist, getWishlist };
