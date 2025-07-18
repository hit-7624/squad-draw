import { NextRequest } from "next/server";
import { prisma } from "@repo/db";
import { withAuth } from "@/lib/auth-middleware";
import { validateAdminPermission } from "../../../../utils";

export const PATCH = withAuth(
  async (
    request: NextRequest,
    user,
    { params }: { params: Promise<{ roomId: string; userId: string }> },
  ) => {
    try {
      const { roomId, userId } = await params;

      await validateAdminPermission(user.id, roomId);

      const targetMember = await prisma.roomMember.findUnique({
        where: { userId_roomId: { userId, roomId } },
        include: { room: true },
      });

      if (!targetMember) {
        return Response.json(
          { error: "User is not a member of this room" },
          { status: 404 },
        );
      }

      // Can't modify the owner's role
      if (targetMember.room.ownerId === userId) {
        return Response.json(
          { error: "Cannot modify room owner privileges" },
          { status: 403 },
        );
      }

      if (targetMember.role === "MEMBER") {
        return Response.json(
          { error: "User is already a member" },
          { status: 400 },
        );
      }

      await prisma.roomMember.update({
        where: { userId_roomId: { userId, roomId } },
        data: { role: "MEMBER" },
      });

      return Response.json({
        message: "Member demoted to member successfully",
      });
    } catch (error: any) {
      if (error.message === "Not a member of this room") {
        return Response.json({ error: error.message }, { status: 403 });
      }
      if (error.message === "Admin permission required") {
        return Response.json({ error: error.message }, { status: 403 });
      }
      console.error("Failed to demote member:", error);
      return Response.json(
        { error: "Failed to demote member" },
        { status: 500 },
      );
    }
  },
);
