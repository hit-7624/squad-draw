import { NextRequest } from 'next/server';
import { prisma } from '@repo/db/nextjs';
import { RoomNameSchema } from '@repo/schemas';
import { ZodError } from 'zod';
import { withAuth } from '@/lib/auth-middleware';

export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const rooms = await prisma.roomMember.findMany({
      where: { userId: user.id },
      include: { 
        room: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            _count: {
              select: {
                members: true,
                shapes: true,
                messages: true
              }
            }
          }
        }
      }
    });
    
    return Response.json({ 
      rooms: rooms.map(rm => ({
        ...rm.room,
        userRole: rm.role,
        memberCount: rm.room._count.members,
        shapeCount: rm.room._count.shapes,
        messageCount: rm.room._count.messages,
        createdAt: rm.room.createdAt.toISOString(),
        updatedAt: rm.room.updatedAt.toISOString(),
      }))
    });
  } catch (error) {
    console.error('Failed to fetch joined rooms:', error);
    return Response.json(
      { error: "Failed to fetch joined rooms" }, 
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const name = RoomNameSchema.parse(body.name);

    const result = await prisma.$transaction(async (tx) => {
      const room = await tx.room.create({
        data: { 
          name: name,
          ownerId: user.id 
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      await tx.roomMember.create({
        data: { 
          roomId: room.id, 
          userId: user.id, 
          role: "ADMIN" 
        }
      });

      return room;
    });

    return Response.json({ room: result }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        { error: error.errors[0]?.message || 'Invalid request' },
        { status: 400 }
      );
    }
    console.error('Failed to create room:', error);
    return Response.json(
      { error: "Failed to create room" }, 
      { status: 500 }
    );
  }
}); 