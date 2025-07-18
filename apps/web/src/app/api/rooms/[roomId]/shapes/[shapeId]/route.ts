import { NextRequest } from "next/server";
import { prisma } from "@repo/db";
import { withAuth } from "@/lib/auth-middleware";
import { validateMembership } from "../../../utils";

interface RouteParams {
  params: Promise<{ roomId: string; shapeId: string }>;
}

export const DELETE = withAuth(
  async (request: NextRequest, user, { params }: RouteParams) => {
    try {
      const { roomId, shapeId } = await params;

      const member = await validateMembership(user.id, roomId);
      if (!member) {
        return Response.json(
          { error: "You are not a member of this room" },
          { status: 403 },
        );
      }

      const shape = await prisma.shape.findUnique({
        where: { id: shapeId },
      });

      if (!shape) {
        return Response.json({ error: "Shape not found" }, { status: 404 });
      }

      if (shape.roomId !== roomId) {
        return Response.json(
          { error: "Shape does not belong to this room" },
          { status: 400 },
        );
      }

      // Allow any member to delete any shape in the room
      await prisma.shape.delete({
        where: { id: shapeId },
      });

      return Response.json({ message: "Shape deleted successfully" });
    } catch (error) {
      console.error("Failed to delete shape:", error);
      return Response.json(
        { error: "Failed to delete shape" },
        { status: 500 },
      );
    }
  },
);
