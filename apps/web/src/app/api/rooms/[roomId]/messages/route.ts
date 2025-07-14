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

      const membership = await prisma.roomMember.findFirst({
        where: {
          roomId: roomId,
          userId: user.id,
        },
      });

      if (!membership) {
        return Response.json(
          { error: "You are not a member of this room" },
          { status: 403 },
        );
      }

      const messages = await prisma.message.findMany({
        where: { roomId: roomId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
        take: 100,
      });

      return Response.json({
        messages: messages.map((msg) => ({
          id: msg.id,
          message: msg.message,
          createdAt: msg.createdAt.toISOString(),
          user: msg.user,
          roomId: msg.roomId,
          userId: msg.userId,
        })),
      });
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      return Response.json(
        { error: "Failed to fetch messages" },
        { status: 500 },
      );
    }
  },
);
