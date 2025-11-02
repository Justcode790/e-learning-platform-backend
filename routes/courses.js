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
  enrollToCourse,
  getMyCourses,
  uploadThumbnail,
  uploadVideo
} = require('../controllers/coursesController');


const Student = require('../models/Student');
const Course = require('../models/Course');
const upload = require('../middleware/upload');


const router = Router();

router.get('/', listCourses);
router.get('/my-courses', authRequired, requireRole('teacher'),getMyCourses);
router.get('/:id', getCourseById);
router.post('/', authRequired, requireRole('teacher'), createCourse);
router.post('/:id/thumbnail', authRequired, requireRole('teacher'), upload.single('thumbnail'), uploadThumbnail);
router.post('/:id/lessons/upload', authRequired, requireRole('teacher'), upload.single('video'), uploadVideo);
router.put('/:id', authRequired, requireRole('teacher'), updateCourse);
router.delete('/:id', authRequired, requireRole('teacher'), deleteCourse);
router.post('/:id/lessons', authRequired, requireRole('teacher'), addLesson);
router.post('/:id/feedback', authRequired, requireRole('student'), addFeedback);

// 🆕 ENROLL / PURCHASE ROUTE
router.post('/:userId/enroll/:id', authRequired, requireRole('student'), enrollToCourse);

module.exports = router;
