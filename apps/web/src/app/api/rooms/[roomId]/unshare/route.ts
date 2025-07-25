import { NextRequest } from "next/server";
import { prisma } from "@repo/db";
import { withAuth } from "@/lib/auth-middleware";

export const PATCH = withAuth(
  async (
    request: NextRequest,
    user,
    { params }: { params: Promise<{ roomId: string }> },
  ) => {
    try {
      const { roomId } = await params;

      const membership = await prisma.roomMember.findFirst({
        where: {
          roomId: roomId,
          userId: user.id,
        },
        include: {
          room: {
            select: {
              ownerId: true,
              isShared: true,
            },
          },
        },
      });

      if (!membership) {
        return Response.json(
          { error: "You are not a member of this room" },
          { status: 404 },
        );
      }

      const isOwner = membership.room.ownerId === user.id;
      const isAdmin = membership.role === "ADMIN";

      if (!isOwner && !isAdmin) {
        return Response.json(
          { error: "Only room owner or admins can unshare the room" },
          { status: 403 },
        );
      }

      await prisma.room.update({
        where: { id: roomId },
        data: { isShared: false },
      });

      return Response.json({ message: "Room unshared successfully" });
    } catch (error) {
      console.error("Failed to unshare room:", error);
      return Response.json(
        { error: "Failed to unshare room" },
        { status: 500 },
      );
    }
  },
);
