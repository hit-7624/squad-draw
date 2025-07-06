import { Request, Response, NextFunction } from 'express';
import { prisma } from '@repo/db';
import '../types/api';

async function isAdmin(roomId: string, userId: string): Promise<boolean> {
  const roomMember = await prisma.roomMember.findFirst({ 
    where: { roomId, userId, role: "ADMIN" } 
  });
  return roomMember !== null;
}



export const adminCheck = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
  try {
    const { roomId } = req.params;
    if (!roomId) {
        res.status(400).json({ message: "Room ID is required" });
        return;
    }
    
    const isCurrentUserAdmin = await isAdmin(roomId, req.user.id);
    if (!isCurrentUserAdmin) {
      res.status(403).json({ message: "You are not authorized to perform this action" });
      return;
    }
    next();
  } catch (error) {
    next(error);
  }
}; 