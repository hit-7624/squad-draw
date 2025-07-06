import { Router, type Router as ExpressRouter } from 'express';
import { signup, login } from '../controllers/auth.controller';
import '../types/api';

const router : ExpressRouter = Router();

router.post('/signup', signup);
router.post('/login', login);

export default router; 