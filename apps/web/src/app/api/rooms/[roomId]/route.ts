import { NextRequest } from "next/server";
import { prisma } from "@repo/db/nextjs";
import { withAuth } from "@/lib/auth-middleware";

export const GET = withAuth(
  async (
    request: NextRequest,
    user,
    { params }: { params: Promise<{ roomId: string }> },
  ) => {
    try {
      const { roomId } = await params;

      const roomMembership = await prisma.roomMember.findFirst({
        where: {
          roomId: roomId,
          userId: user.id,
        },
        include: {
          room: {
            include: {
              owner: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (!roomMembership) {
        return Response.json(
          { error: "You are not a member of this room" },
          { status: 403 },
        );
      }

      const room = {
        id: roomMembership.room.id,
        name: roomMembership.room.name,
        createdAt: roomMembership.room.createdAt.toISOString(),
        updatedAt: roomMembership.room.updatedAt.toISOString(),
        isShared: roomMembership.room.isShared,
        owner: roomMembership.room.owner,
        userRole: roomMembership.role,
        memberCount: 0, // Will be calculated separately if needed
        shapeCount: 0, // Will be calculated separately if needed
        messageCount: 0, // Will be calculated separately if needed
      };

      return Response.json({ room });
    } catch (error) {
      console.error("Failed to fetch room:", error);
      return Response.json({ error: "Failed to fetch room" }, { status: 500 });
    }
  },
);

export const DELETE = withAuth(
  async (
    request: NextRequest,
    user,
    { params }: { params: Promise<{ roomId: string }> },
  ) => {
    try {
      const { roomId } = await params;

      const room = await prisma.room.findUnique({
        where: { id: roomId },
        select: { ownerId: true },
      });

      if (!room) {
        return Response.json({ error: "Room not found" }, { status: 404 });
      }

      if (room.ownerId !== user.id) {
        return Response.json(
          { error: "Only room owner can delete the room" },
          { status: 403 },
        );
      }

      await prisma.room.delete({
        where: { id: roomId },
      });

      return Response.json({ message: "Room deleted successfully" });
    } catch (error) {
      console.error("Failed to delete room:", error);
      return Response.json({ error: "Failed to delete room" }, { status: 500 });
    }
  },
);
