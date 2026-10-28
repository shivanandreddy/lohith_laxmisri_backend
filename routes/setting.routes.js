import express from 'express';
import { getThemeSettings, updateThemeSettings } from '../controllers/setting.controller.js';
import { protect, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/theme', getThemeSettings);
router.put('/theme', protect, authorizeRoles('admin'), updateThemeSettings);

export default router;