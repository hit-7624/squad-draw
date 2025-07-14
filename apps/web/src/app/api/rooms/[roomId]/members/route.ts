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

      const members = await prisma.roomMember.findMany({
        where: { roomId: roomId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          room: {
            select: {
              ownerId: true,
            },
          },
        },
        orderBy: { joinedAt: "asc" },
      });

      return Response.json({
        members: members.map((member) => ({
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          role: member.role,
          isOwner: member.room.ownerId === member.user.id,
        })),
      });
    } catch (error) {
      console.error("Failed to fetch members:", error);
      return Response.json(
        { error: "Failed to fetch members" },
        { status: 500 },
      );
    }
  },
);
