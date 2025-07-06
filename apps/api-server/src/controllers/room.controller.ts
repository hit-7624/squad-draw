import { Request, Response, NextFunction } from 'express';
import { prisma } from '@repo/db';
import '../types/api';

export const getJoinedRooms = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
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

export const createRoom = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
  try {
    const { name } = req.body;
    
    if (!name) {
       res.status(400).json({ message: "Room name is required" });
       return;
    }

    const room = await prisma.room.create({ 
      data: { name, ownerId: req.user.id } 
    });
    
    await prisma.roomMember.create({ 
      data: { roomId: room.id, userId: req.user.id, role: "ADMIN" } 
    });
    
    res.status(201).json({ room });
  } catch (error) {
    res.status(500).json({ message: "Failed to create room" });
  }
};

export const joinRoom = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
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

export const leaveRoom = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
  try {
    const { roomId } = req.params;
    
    if (!roomId) {
      res.status(400).json({ message: "Room ID is required" });
      return;
    }

    const roomMember = await prisma.roomMember.delete({
      where: { userId_roomId: { userId: req.user.id, roomId } }
    });
    
    res.status(200).json({ roomMember });
  } catch (error) {
    next(error);
  }
};

export const kickMember = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
  try {
    const { roomId, userId } = req.params;
    
    if (!userId || !roomId) {
      res.status(400).json({ message: "Room ID and User ID are required" });
      return;
    }

    const roomMember = await prisma.roomMember.delete({
      where: { userId_roomId: { userId, roomId } }
    });
    
    res.status(200).json({ roomMember });
  } catch (error) {
    next(error);
  }
};

export const promoteMember = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
  try {
    const { roomId, userId } = req.params;
    
    if (!userId || !roomId) {
      res.status(400).json({ message: "Room ID and User ID are required" });
      return;
    }

    const roomMember = await prisma.roomMember.update({
      where: { userId_roomId: { userId, roomId } },
      data: { role: "ADMIN" }
    });
    
    res.status(200).json({ roomMember });
  } catch (error) {
    next(error);
  }
};

export const deleteRoom = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
  try {
    const { roomId } = req.params;
    
    if (!roomId) {
      res.status(400).json({ message: "Room ID is required" });
      return;
    }

    const room = await prisma.room.findUnique({ 
      where: { id: roomId, ownerId: req.user.id } 
    });
    
    if (!room) {
      res.status(403).json({ message: "You are not authorized to delete this room" });
      return;
    }

    const deletedRoom = await prisma.room.delete({ 
      where: { id: roomId } 
    });
    
    res.status(200).json({ room: deletedRoom });
  } catch (error) {
    next(error);
  }
}; 

export const demoteMember = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
  try {
    const { roomId, userId } = req.params;

    if (!userId || !roomId) {
      res.status(400).json({ message: "Room ID and User ID are required" });
      return;
    }

    const roomMember = await prisma.roomMember.update({
      where: { userId_roomId: { userId, roomId } },
      data: { role: "MEMBER" }
    });
    
    res.status(200).json({ roomMember });
  } catch (error) {
        next(error);
  }
};


export const getMessages = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
  try {
    const { roomId } = req.params;
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

export const getShapes = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
  try {
    const { roomId } = req.params;
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