import { Router, type Router as ExpressRouter } from 'express';
import { signup, login, logout, me } from '../controllers/auth.controller';
import '../types/api';
import { authMiddleware } from '../middlewares/auth.middleware';

const router : ExpressRouter = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authMiddleware, me);
export default router; 