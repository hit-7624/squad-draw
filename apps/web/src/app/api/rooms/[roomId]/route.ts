import { NextRequest } from 'next/server';
import { prisma } from '@repo/db/nextjs';
import { withAuth } from '@/lib/auth-middleware';

export const DELETE = withAuth(async (request: NextRequest, user, { params }: { params: Promise<{ roomId: string }> }) => {
  try {
    const { roomId } = await params;

    // Check if user is the owner of the room
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: { ownerId: true }
    });

    if (!room) {
      return Response.json(
        { error: "Room not found" }, 
        { status: 404 }
      );
    }

    if (room.ownerId !== user.id) {
      return Response.json(
        { error: "Only room owner can delete the room" }, 
        { status: 403 }
      );
    }

    // Delete the room (this will cascade delete members, messages, shapes due to foreign key constraints)
    await prisma.room.delete({
      where: { id: roomId }
    });

    return Response.json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error('Failed to delete room:', error);
    return Response.json(
      { error: "Failed to delete room" }, 
      { status: 500 }
    );
  }
}); 