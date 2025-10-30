const { Router } = require('express');
const { authRequired, requireRole } = require('../middleware/authMiddleware');
const {
  listCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  addLesson,
  addFeedback,
  enrollToCourse
} = require('../controllers/coursesController');
const Student = require('../models/Student');
const Course = require('../models/Course');

const router = Router();

router.get('/', listCourses);
router.get('/:id', getCourseById);
router.post('/', authRequired, requireRole('teacher'), createCourse);
router.put('/:id', authRequired, requireRole('teacher'), updateCourse);
router.delete('/:id', authRequired, requireRole('teacher'), deleteCourse);
router.post('/:id/lessons', authRequired, requireRole('teacher'), addLesson);
router.post('/:id/feedback', authRequired, requireRole('student'), addFeedback);

// 🆕 ENROLL / PURCHASE ROUTE
router.post('/:id/enroll', authRequired, requireRole('student'), enrollToCourse);

module.exports = router;
