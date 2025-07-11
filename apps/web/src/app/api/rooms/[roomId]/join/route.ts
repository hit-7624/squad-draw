import { NextRequest } from 'next/server';
import { prisma } from '@repo/db/nextjs';
import { withAuth } from '@/lib/auth-middleware';

const MAX_JOINED_ROOMS = 5;

export const POST = withAuth(async (request: NextRequest, user, { params }:  { params: Promise<{ roomId: string }> }) => {
  try {
    const { roomId } = await params;

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: { id: true, name: true, isShared: true }
    });

    if (!room) {
      return Response.json(
        { error: "Room not found" }, 
        { status: 404 }
      );
    }

    if (!room.isShared) {
      return Response.json(
        { error: "Room is not shared and cannot be joined" }, 
        { status: 403 }
      );
    }

    const existingMember = await prisma.roomMember.findFirst({
      where: {
        roomId: roomId,
        userId: user.id
      }
    });

    if (existingMember) {
      return Response.json(
        { error: "You are already a member of this room" }, 
        { status: 400 }
      );
    }

    const userJoinedRoomsCount = await prisma.roomMember.count({
      where: { userId: user.id }
    });

    if (userJoinedRoomsCount >= MAX_JOINED_ROOMS) {
      return Response.json(
        { 
          error: `You can only join up to ${MAX_JOINED_ROOMS} rooms. Please leave an existing room to join a new one.`,
          limit: MAX_JOINED_ROOMS,
          current: userJoinedRoomsCount
        }, 
        { status: 400 }
      );
    }

    await prisma.roomMember.create({
      data: {
        roomId: roomId,
        userId: user.id,
        role: "MEMBER"
      }
    });

    return Response.json({ 
      message: "Successfully joined room",
      room: { id: room.id, name: room.name }
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to join room:', error);
    return Response.json(
      { error: "Failed to join room" }, 
      { status: 500 }
    );
  }
}); 