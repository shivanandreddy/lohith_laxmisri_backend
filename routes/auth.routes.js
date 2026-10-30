import express from 'express';
import { registerUser, loginUser, getMe, getUserTheme, updateUserTheme, getPublicTheme} from '../controllers/auth.controller.js';
import { protect, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

// Theme sync routes tied to User model
router.get('/theme', protect, getUserTheme);
router.put('/theme', protect, authorizeRoles("admin"),updateUserTheme);
router.get('/theme/public', getPublicTheme);

export default router;