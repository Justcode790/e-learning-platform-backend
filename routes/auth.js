const { Router } = require('express');
const { register, login, me } = require('../controllers/authController');
const { authRequired } = require('../middleware/authMiddleware');

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authRequired, me);

module.exports = router;