import { NextRequest } from "next/server";
import { prisma } from "@repo/db/nextjs";
import { withAuth } from "@/lib/auth-middleware";
import { validateAdminPermission } from "../../../utils";

// Kick member from room
export const DELETE = withAuth(
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

      // Prevent kicking the room owner
      if (targetMember.room.ownerId === userId) {
        return Response.json(
          { error: "Cannot kick the room owner" },
          { status: 403 },
        );
      }

      // Prevent users from kicking themselves
      if (userId === user.id) {
        return Response.json(
          { error: "Cannot kick yourself. Use leave room instead" },
          { status: 400 },
        );
      }

      await prisma.roomMember.delete({
        where: { userId_roomId: { userId, roomId } },
      });

      return Response.json({ message: "Member kicked successfully" });
    } catch (error: any) {
      if (error.message === "Not a member of this room") {
        return Response.json({ error: error.message }, { status: 403 });
      }
      if (error.message === "Admin permission required") {
        return Response.json({ error: error.message }, { status: 403 });
      }
      console.error("Failed to kick member:", error);
      return Response.json({ error: "Failed to kick member" }, { status: 500 });
    }
  },
);
