import { NextRequest } from 'next/server';
import { prisma } from '@repo/db/nextjs';
import { withAuth } from '@/lib/auth-middleware';

export const POST = withAuth(async (request: NextRequest, user, { params }:  { params: Promise<{ roomId: string }> }) => {
  try {
    const { roomId } = await params;

    // Check if room exists
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

    // Check if room is shared (public)
    if (!room.isShared) {
      return Response.json(
        { error: "Room is not shared and cannot be joined" }, 
        { status: 403 }
      );
    }

    // Check if user is already a member
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

    // Add user as a member
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