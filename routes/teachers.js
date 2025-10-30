const { Router } = require('express');
const { authRequired, requireRole } = require('../middleware/authMiddleware');
const { getAllTeachers, getTeacherById, updateTeacher } = require('../controllers/teachersController');

const router = Router();

router.get('/', getAllTeachers);
router.get('/:id', getTeacherById);
router.put('/:id', authRequired, requireRole('teacher'), updateTeacher);

module.exports = router;