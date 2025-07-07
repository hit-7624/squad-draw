import { Request, Response, NextFunction } from 'express';
import { prisma } from '@repo/db';
import '../types/api';

const validateMembership = async (userId: string, roomId: string) => {
  const member = await prisma.roomMember.findUnique({
    where: { userId_roomId: { userId, roomId } },
    include: { room: true }
  });
  return member;
};

const validateAdminPermission = async (userId: string, roomId: string) => {
  const member = await validateMembership(userId, roomId);
  if (!member) {
    throw new Error('Not a member of this room');
  }
  if (member.role !== 'ADMIN' && member.room.ownerId !== userId) {
    throw new Error('Admin permission required');
  }
  return member;
};

const validateOwnerPermission = async (userId: string, roomId: string) => {
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) {
    throw new Error('Room not found');
  }
  if (room.ownerId !== userId) {
    throw new Error('Owner permission required');
  }
  return room;
};

export const getJoinedRooms = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rooms = await prisma.roomMember.findMany({
      where: { userId: req.user.id },
      include: { room: true }
    });
    res.status(200).json({ rooms: rooms.map(rm => rm.room) });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch joined rooms" });
  }
};

export const createRoom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name } = req.body;
    
    const result = await prisma.$transaction(async (tx) => {
      const room = await tx.room.create({ 
        data: { name, ownerId: req.user.id } 
      });
      
      await tx.roomMember.create({ 
        data: { roomId: room.id, userId: req.user.id, role: "ADMIN" } 
      });
      
      return room;
    });
    
    res.status(201).json({ room: result });
  } catch (error) {
    next(error);
  }
};

export const joinRoom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { roomId } = req.params;
    if (!roomId) {
      res.status(400).json({ message: "Room ID is required" });
      return;
    }

    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      res.status(404).json({ message: "Room not found" });
      return;
    }


    const existingMember = await prisma.roomMember.findUnique({
      where: { userId_roomId: { userId: req.user.id, roomId } }
    });
    
    if (existingMember) {
      res.status(400).json({ message: "You are already a member of this room" });
      return;
    }

    const roomMember = await prisma.roomMember.create({ 
      data: { roomId, userId: req.user.id, role: "MEMBER" } 
    });
    
    res.status(201).json({ room: roomMember });
  } catch (error) {
    next(error);
  }
};

export const leaveRoom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { roomId } = req.params;
    if (!roomId) {
      res.status(400).json({ message: "Room ID is required" });
      return;
    }
    
    const member = await validateMembership(req.user.id, roomId);
    if (!member) {
      res.status(404).json({ message: "You are not a member of this room" });
      return;
    }

    const room = member.room;

    if (room.ownerId === req.user.id) {
      const memberCount = await prisma.roomMember.count({
        where: { roomId }
      });

      if (memberCount === 1) {
        await prisma.$transaction(async (tx) => {
          await tx.roomMember.delete({
            where: { userId_roomId: { userId: req.user.id, roomId } }
          });
          await tx.room.delete({
            where: { id: roomId }
          });
        });

        res.status(200).json({ message: "Room deleted as you were the only member" });
        return;
      } else {
        const otherAdmin = await prisma.roomMember.findFirst({
          where: { 
            roomId, 
            userId: { not: req.user.id }, 
            role: "ADMIN" 
          }
        });

        if (otherAdmin) {
          await prisma.$transaction(async (tx) => {
            await tx.room.update({
              where: { id: roomId },
              data: { ownerId: otherAdmin.userId }
            });
            await tx.roomMember.delete({
              where: { userId_roomId: { userId: req.user.id, roomId } }
            });
          });
          
          res.status(200).json({ message: "Ownership transferred and left room successfully" });
          return;
        } else {
          const firstMember = await prisma.roomMember.findFirst({
            where: { 
              roomId, 
              userId: { not: req.user.id } 
            }
          });

          if (firstMember) {
            await prisma.$transaction(async (tx) => {
              await tx.roomMember.update({
                where: { userId_roomId: { userId: firstMember.userId, roomId } },
                data: { role: "ADMIN" }
              });
              await tx.room.update({
                where: { id: roomId },
                data: { ownerId: firstMember.userId }
              });
              await tx.roomMember.delete({
                where: { userId_roomId: { userId: req.user.id, roomId } }
              });
            });
            
            res.status(200).json({ message: "Ownership transferred to new admin and left room successfully" });
            return;
          }
        }
      }
    }

    await prisma.roomMember.delete({
      where: { userId_roomId: { userId: req.user.id, roomId } }
    });
    
    res.status(200).json({ message: "Left room successfully" });
  } catch (error) {
    next(error);
  }
};

export const kickMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { roomId, userId } = req.params;
    if (!roomId || !userId) {
      res.status(400).json({ message: "Room ID and user ID are required" });
      return;
    }

    await validateAdminPermission(req.user.id, roomId);
    
    const targetMember = await validateMembership(userId, roomId);
    if (!targetMember) {
      res.status(404).json({ message: "User is not a member of this room" });
      return;
    }

    if (targetMember.room.ownerId === userId) {
      res.status(403).json({ message: "Cannot kick room owner" });
      return;
    }

    if (userId === req.user.id) {
      res.status(400).json({ message: "Cannot kick yourself" });
      return;
    }

    const roomMember = await prisma.roomMember.delete({
      where: { userId_roomId: { userId, roomId } }
    });
    
    res.status(200).json({ roomMember });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Not a member of this room') {
        res.status(404).json({ message: error.message });
        return;
      }
      if (error.message === 'Admin permission required') {
        res.status(403).json({ message: error.message });
        return;
      }
    }
    next(error);
  }
};

export const promoteMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { roomId, userId } = req.params;
    if (!roomId || !userId) {
      res.status(400).json({ message: "Room ID and user ID are required" });
      return;
    }

    await validateAdminPermission(req.user.id, roomId);
    
    const targetMember = await validateMembership(userId, roomId);
    if (!targetMember) {
      res.status(404).json({ message: "User is not a member of this room" });
      return;
    }

    if (targetMember.role === "ADMIN") {
      res.status(400).json({ message: "User is already an admin" });
      return;
    }

    const roomMember = await prisma.roomMember.update({
      where: { userId_roomId: { userId, roomId } },
      data: { role: "ADMIN" }
    });
    
    res.status(200).json({ roomMember });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Not a member of this room') {
        res.status(404).json({ message: error.message });
        return;
      }
      if (error.message === 'Admin permission required') {
        res.status(403).json({ message: error.message });
        return;
      }
    }
    next(error);
  }
};

export const deleteRoom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { roomId } = req.params;
    if (!roomId) {
      res.status(400).json({ message: "Room ID is required" });
      return;
    }

    await validateOwnerPermission(req.user.id, roomId);

    const deletedRoom = await prisma.room.delete({ 
      where: { id: roomId } 
    });
    
    res.status(200).json({ room: deletedRoom });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Room not found') {
        res.status(404).json({ message: error.message });
        return;
      }
      if (error.message === 'Owner permission required') {
        res.status(403).json({ message: error.message });
        return;
      }
    }
    next(error);
  }
}; 

export const demoteMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { roomId, userId } = req.params;
    if (!roomId || !userId) {
      res.status(400).json({ message: "Room ID and user ID are required" });
      return;
    }

    await validateAdminPermission(req.user.id, roomId);

    const targetMember = await validateMembership(userId, roomId);
    if (!targetMember) {
      res.status(404).json({ message: "User is not a member of this room" });
      return;
    }

    if (targetMember.role === "ADMIN") {
      res.status(400).json({ message: "User is an admin" });
      return;
    }

    if (targetMember.room.ownerId === userId) {
      res.status(403).json({ message: "Cannot demote room owner" });
      return;
    }

    const adminCount = await prisma.roomMember.count({
      where: { roomId, role: "ADMIN" }
    });

    if (adminCount <= 1) {
      res.status(403).json({ message: "Cannot demote the last admin" });
      return;
    }

    const roomMember = await prisma.roomMember.update({
      where: { userId_roomId: { userId, roomId } },
      data: { role: "MEMBER" }
    });
    
    res.status(200).json({ roomMember });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Not a member of this room') {
        res.status(404).json({ message: error.message });
        return;
      }
      if (error.message === 'Admin permission required') {
        res.status(403).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: "Internal server error" });
      return;
    }
    
    next(error);
  }
};

export const getMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { roomId } = req.params;
    if (!roomId) {
      res.status(400).json({ message: "Room ID is required" });
      return;
    }

    const member =  await validateMembership(req.user.id, roomId);
    if (!member) {
      res.status(403).json({ message: "Access denied: You are not a member of this room" });
      return;
    }
    
    const messages = await prisma.message.findMany({
      where: { roomId },
      orderBy: {
        createdAt: 'asc',
      },
      include: { user: true },
      take: 100,
    });
    res.status(200).json({ messages });
  } catch (error) {
    next(error);
  }
};

export const getShapes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { roomId } = req.params;
    if (!roomId) {
      res.status(400).json({ message: "Room ID is required" });
      return;
    }

    const member = await validateMembership(req.user.id, roomId);
    if (!member) {
      res.status(403).json({ message: "Access denied: You are not a member of this room" });
      return;
    }
    
    const shapes = await prisma.shape.findMany({
      where: { roomId },    
      orderBy: {
        createdAt: 'asc',
      },
      include: { creator: true },
      take: 100,
    });
    res.status(200).json({ shapes });
  } catch (error) {
    next(error);
  }
};



export const createShape = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { roomId } = req.params;
    const {newShape} = req.body;
    if (!roomId) {
      res.status(400).json({ message: "Room ID is required" });
      return;
    }

    const member = await validateMembership(req.user.id, roomId);
    if (!member) {
      res.status(403).json({ message: "Access denied: You are not a member of this room" });
      return;
    }
    
    const shape = await prisma.shape.create({
      data: {
        ...newShape,
        roomId,
        creatorId: req.user.id,
      },
    });
    res.status(201).json({ shape });
  } catch (error) {
    next(error);
  }
};

export const createMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { roomId } = req.params;
    const {newMessage} = req.body;
    if (!roomId) {
      res.status(400).json({ message: "Room ID is required" });
      return;
    }

    const member = await validateMembership(req.user.id, roomId);
    if (!member) {
      res.status(403).json({ message: "Access denied: You are not a member of this room" });
      return;
    }
    
    const message = await prisma.message.create({
      data: {
        ...newMessage,
        roomId,
        creatorId: req.user.id,
      },
    });
    res.status(201).json({ message });
  } catch (error) {
    next(error);
  }
};