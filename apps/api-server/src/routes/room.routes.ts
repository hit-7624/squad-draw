import { Router, type Router as ExpressRouter } from 'express';
import { getJoinedRooms, createRoom, joinRoom, leaveRoom, kickMember, promoteMember, deleteRoom, getMessages, getShapes, getMembers, demoteMember, createShape, deleteShape, clearAllShapes, createMessage, shareRoom, unshareRoom } from '../controllers/room.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { adminCheck } from '../middlewares/admin.middleware';
import '../types/api';

const router: ExpressRouter = Router();

router.use(authMiddleware);

router.get('/joined-rooms', getJoinedRooms);
router.post('/', createRoom);
router.post('/:roomId/join', joinRoom);
router.delete('/:roomId/leave', leaveRoom);
router.delete('/:roomId/members/:userId', adminCheck, kickMember);
router.patch('/:roomId/members/:userId/promote', adminCheck, promoteMember);
router.patch('/:roomId/members/:userId/demote', adminCheck, demoteMember);
router.delete('/:roomId', deleteRoom);

router.patch('/:roomId/share', shareRoom);
router.patch('/:roomId/unshare', unshareRoom);

router.get('/:roomId/messages', getMessages);
router.get('/:roomId/members', getMembers);
router.get('/:roomId/shapes', getShapes);
router.post('/:roomId/shapes', createShape);
router.delete('/:roomId/shapes/:shapeId', deleteShape);
router.delete('/:roomId/shapes', adminCheck, clearAllShapes);
router.post('/:roomId/messages',adminCheck, createMessage);

export default router; 