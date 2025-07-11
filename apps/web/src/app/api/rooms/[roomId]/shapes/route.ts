import { NextRequest } from 'next/server';
import { prisma } from '@repo/db/nextjs';
import { SimpleShapeSchema } from '@repo/schemas';
import { ZodError } from 'zod';
import { withAuth } from '@/lib/auth-middleware';
import { validateMembership, validateAdminPermission } from '../../utils';

interface RouteParams {
  params: Promise<{ roomId: string }>;
}

export const GET = withAuth(async (request: NextRequest, user, context: RouteParams) => {
  try {
    const { roomId } = await context.params;

    const member = await validateMembership(user.id, roomId);
    if (!member) {
      return Response.json(
        { error: "You are not a member of this room" },
        { status: 403 }
      );
    }

    const shapes = await prisma.shape.findMany({
      where: { roomId },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return Response.json({ shapes });
  } catch (error) {
    console.error('Failed to fetch shapes:', error);
    return Response.json(
      { error: "Failed to fetch shapes" },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (request: NextRequest, user, context: RouteParams) => {
  try {
    const { roomId } = await context.params;
    const body = await request.json();

    const member = await validateMembership(user.id, roomId);
    if (!member) {
      return Response.json(
        { error: "You are not a member of this room" },
        { status: 403 }
      );
    }

    const validatedShape = SimpleShapeSchema.parse(body);

    const shape = await prisma.shape.create({
      data: {
        ...validatedShape,
        roomId,
        creatorId: user.id
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return Response.json({ shape }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        { error: error.errors[0]?.message || 'Invalid request' },
        { status: 400 }
      );
    }
    console.error('Failed to create shape:', error);
    return Response.json(
      { error: "Failed to create shape" },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (request: NextRequest, user, context: RouteParams) => {
  try {
    const { roomId } = await context.params;

    await validateAdminPermission(user.id, roomId);

    await prisma.shape.deleteMany({
      where: { roomId }
    });

    return Response.json({ message: "All shapes cleared successfully" });
  } catch (error: any) {
    if (error.message === 'Not a member of this room') {
      return Response.json({ error: error.message }, { status: 403 });
    }
    if (error.message === 'Admin permission required') {
      return Response.json({ error: error.message }, { status: 403 });
    }
    console.error('Failed to clear shapes:', error);
    return Response.json(
      { error: "Failed to clear shapes" },
      { status: 500 }
    );
  }
}); 