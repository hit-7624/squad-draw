import { NextRequest } from 'next/server';
import { prisma } from '@repo/db/nextjs';
import { withAuth } from '@/lib/auth-middleware';

export const DELETE = withAuth(async (request: NextRequest, user, { params }: { params: Promise<{ roomId: string }> }) => {
  try {
    const { roomId } = await params;

    // Check if user is a member of the room
    const membership = await prisma.roomMember.findFirst({
      where: {
        roomId: roomId,
        userId: user.id
      },
      include: {
        room: {
          select: {
            ownerId: true,
            name: true
          }
        }
      }
    });

    if (!membership) {
      return Response.json(
        { error: "You are not a member of this room" }, 
        { status: 404 }
      );
    }

    // If user is the owner, we need to handle ownership transfer
    if (membership.room.ownerId === user.id) {
      // Find another admin to transfer ownership to
      const otherAdmin = await prisma.roomMember.findFirst({
        where: {
          roomId: roomId,
          userId: { not: user.id },
          role: "ADMIN"
        }
      });

      if (otherAdmin) {
        // Transfer ownership to another admin
        await prisma.room.update({
          where: { id: roomId },
          data: { ownerId: otherAdmin.userId }
        });
      } else {
        // Find the oldest member to transfer ownership to
        const oldestMember = await prisma.roomMember.findFirst({
          where: {
            roomId: roomId,
            userId: { not: user.id }
          },
          orderBy: { joinedAt: 'asc' }
        });

        if (oldestMember) {
          // Transfer ownership and promote to admin
          await prisma.$transaction([
            prisma.room.update({
              where: { id: roomId },
              data: { ownerId: oldestMember.userId }
            }),
            prisma.roomMember.update({
              where: { id: oldestMember.id },
              data: { role: "ADMIN" }
            })
          ]);
        } else {
          // No other members, delete the room
          await prisma.room.delete({
            where: { id: roomId }
          });
          return Response.json({ message: "Room deleted as you were the last member" });
        }
      }
    }

    // Remove user from room
    await prisma.roomMember.delete({
      where: { id: membership.id }
    });

    return Response.json({ message: "Successfully left room" });
  } catch (error) {
    console.error('Failed to leave room:', error);
    return Response.json(
      { error: "Failed to leave room" }, 
      { status: 500 }
    );
  }
}); 