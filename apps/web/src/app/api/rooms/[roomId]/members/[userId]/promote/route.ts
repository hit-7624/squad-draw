import { NextRequest } from 'next/server';
import { prisma } from '@repo/db/nextjs';
import { withAuth } from '@/lib/auth-middleware';
import { validateAdminPermission } from '../../../../utils';

interface RouteParams {
  params: { roomId: string; userId: string };
}

export const PATCH = withAuth(async (request: NextRequest, user, { params }: RouteParams) => {
  try {
    const { roomId, userId } = params;

    await validateAdminPermission(user.id, roomId);

    const targetMember = await prisma.roomMember.findUnique({
      where: { userId_roomId: { userId, roomId } },
      include: { room: true }
    });

    if (!targetMember) {
      return Response.json(
        { error: "User is not a member of this room" },
        { status: 404 }
      );
    }

    // Can't modify the owner's role
    if (targetMember.room.ownerId === userId) {
      return Response.json(
        { error: "Cannot modify room owner privileges" },
        { status: 403 }
      );
    }

    if (targetMember.role === 'ADMIN') {
      return Response.json(
        { error: "User is already an admin" },
        { status: 400 }
      );
    }

    await prisma.roomMember.update({
      where: { userId_roomId: { userId, roomId } },
      data: { role: 'ADMIN' }
    });

    return Response.json({ message: "Member promoted to admin successfully" });
  } catch (error: any) {
    if (error.message === 'Not a member of this room') {
      return Response.json({ error: error.message }, { status: 403 });
    }
    if (error.message === 'Admin permission required') {
      return Response.json({ error: error.message }, { status: 403 });
    }
    console.error('Failed to promote member:', error);
    return Response.json(
      { error: "Failed to promote member" },
      { status: 500 }
    );
  }
}); 