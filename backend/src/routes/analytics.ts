import { Router } from 'express';
import { getTeacherAnalytics, getStudentAnalytics } from '../controllers/analyticsController';
import { protect, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

router.use(protect);
router.get('/', authorize(UserRole.TEACHER), getTeacherAnalytics);
router.get('/student', authorize(UserRole.STUDENT), getStudentAnalytics);

export default router;
