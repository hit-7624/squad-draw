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
          { error: "Only room owner or admins can share the room" },
          { status: 403 },
        );
      }

      await prisma.room.update({
        where: { id: roomId },
        data: { isShared: true },
      });

      const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
      if (!BASE_URL)
        throw new Error(
          "NEXT_PUBLIC_BASE_URL environment variable is required",
        );

      return Response.json({
        message: "Room shared successfully",
        shareLink: `${BASE_URL}/room/${roomId}`,
      });
    } catch (error) {
      console.error("Failed to share room:", error);
      return Response.json({ error: "Failed to share room" }, { status: 500 });
    }
  },
);
