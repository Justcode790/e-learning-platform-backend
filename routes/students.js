const { Router } = require('express');
const { authRequired, requireRole } = require('../middleware/authMiddleware');
const {
  getStudentById,
  updateStudent,
  enrollInCourse,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} = require('../controllers/studentsController');

const router = Router();

router.get('/:id', authRequired, getStudentById);
router.put('/:id', authRequired, requireRole('student'), updateStudent);
router.post('/enroll/:id', authRequired, requireRole('student'), enrollInCourse);

// Wishlist routes
router.get('/:id/wishlist', authRequired, requireRole('student'), getWishlist);
router.post('/:id/wishlist/:courseId', authRequired, requireRole('student'), addToWishlist);
router.delete('/:id/wishlist/:courseId', authRequired, requireRole('student'), removeFromWishlist);

module.exports = router;
