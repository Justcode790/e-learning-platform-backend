const { Router } = require('express');
const { authRequired, requireRole } = require('../middleware/authMiddleware');
const {
  getStudentById,
  updateStudent,
  enrollInCourse,
} = require('../controllers/studentsController');

const router = Router();

router.get('/:id', authRequired, getStudentById);
router.put('/:id', authRequired, requireRole('student'), updateStudent);
router.post('/enroll/:id', authRequired, requireRole('student'), enrollInCourse);

module.exports = router;
