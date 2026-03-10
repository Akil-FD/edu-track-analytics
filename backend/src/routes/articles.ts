import { Router } from 'express';
import {
  getArticles, getArticle, createArticle, updateArticle, deleteArticle,
} from '../controllers/articleController';
import { protect, authorize } from '../middleware/auth';
import { upload } from '../middleware/errorHandler';
import { UserRole } from '../types';

const router = Router();

router.use(protect);

router.get('/', getArticles);
router.get('/:id', getArticle);
router.post('/', authorize(UserRole.TEACHER), upload.array('files', 10), createArticle);
router.put('/:id', authorize(UserRole.TEACHER), upload.array('files', 10), updateArticle);
router.delete('/:id', authorize(UserRole.TEACHER), deleteArticle);

export default router;
