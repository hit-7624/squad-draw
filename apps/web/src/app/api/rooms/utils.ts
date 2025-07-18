import { prisma } from "@repo/db";
import { NextRequest } from "next/server";
import { getAuthenticatedUser, AuthenticatedUser } from "@/lib/auth-middleware";

export const validateMembership = async (userId: string, roomId: string) => {
  const member = await prisma.roomMember.findUnique({
    where: { userId_roomId: { userId, roomId } },
    include: { room: true },
  });
  return member;
};

export const validateAdminPermission = async (
  userId: string,
  roomId: string,
) => {
  const member = await validateMembership(userId, roomId);
  if (!member) {
    throw new Error("Not a member of this room");
  }
  if (member.role !== "ADMIN" && member.room.ownerId !== userId) {
    throw new Error("Admin permission required");
  }
  return member;
};

export const validateOwnerPermission = async (
  userId: string,
  roomId: string,
) => {
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) {
    throw new Error("Room not found");
  }
  if (room.ownerId !== userId) {
    throw new Error("Owner permission required");
  }
  return room;
};

export const createErrorResponse = (message: string, status: number) => {
  return Response.json({ message }, { status });
};

export const createSuccessResponse = (data: any, status: number = 200) => {
  return Response.json(data, { status });
};

export const getUserFromRequest = async (
  request: NextRequest,
): Promise<AuthenticatedUser> => {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
};
