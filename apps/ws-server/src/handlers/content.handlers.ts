import { Socket } from "socket.io";
import { prisma, Message } from "@repo/db/ws-server";
import { ShapeType } from "@repo/db/ws-server";

interface NewShapeData {
  type: ShapeType;
  dataFromRoughJs: any;
  roomId: string;
  creatorId: string;
}

export const newShapeHandler = async (
  socket: Socket,
  newShape: NewShapeData,
) => {
  const { type, dataFromRoughJs, roomId, creatorId } = newShape;

  if (socket.data.currentRoom !== roomId) {
    socket.emit("custom-error", {
      code: 400,
      type: "NOT_IN_ROOM",
      message:
        "You are not in this room! dont try to send shapes to other rooms , dont do these crazy things",
    });
    return;
  }

  const createdShape = await prisma.shape.create({
    data: {
      type: type,
      dataFromRoughJs: dataFromRoughJs,
      roomId: roomId,
      creatorId: creatorId,
    },
  });

  socket.to(roomId).emit("new-shape-added", createdShape);
};

export const newMessageHandler = async (
  socket: Socket,
  data: { message: string; roomId: string },
) => {
  // Validate user authentication
  if (!socket.data.user) {
    socket.emit("custom-error", {
      code: 401,
      type: "UNAUTHORIZED",
      message: "User not authenticated",
    });
    return;
  }

  // Validate input data
  if (!data || typeof data !== "object") {
    socket.emit("custom-error", {
      code: 400,
      type: "INVALID_DATA",
      message: "Invalid message data format",
    });
    return;
  }

  // Validate message content
  if (
    !data.message ||
    typeof data.message !== "string" ||
    !data.message.trim()
  ) {
    socket.emit("custom-error", {
      code: 400,
      type: "INVALID_MESSAGE",
      message: "Message content is required and must be a non-empty string",
    });
    return;
  }

  // Validate message length (max 1000 characters)
  if (data.message.trim().length > 1000) {
    socket.emit("custom-error", {
      code: 400,
      type: "MESSAGE_TOO_LONG",
      message: "Message cannot exceed 1000 characters",
    });
    return;
  }

  // Validate roomId
  if (!data.roomId || typeof data.roomId !== "string" || !data.roomId.trim()) {
    socket.emit("custom-error", {
      code: 400,
      type: "INVALID_ROOM_ID",
      message: "Room ID is required and must be a valid string",
    });
    return;
  }

  // Check if user is in the room
  if (socket.data.currentRoom !== data.roomId) {
    socket.emit("custom-error", {
      code: 400,
      type: "NOT_IN_ROOM",
      message: "You are not in this room",
    });
    return;
  }

  try {
    // Verify room exists and user is a member
    const roomMembership = await prisma.roomMember.findFirst({
      where: {
        roomId: data.roomId,
        userId: socket.data.user.id,
      },
      include: {
        room: true,
      },
    });

    if (!roomMembership) {
      socket.emit("custom-error", {
        code: 403,
        type: "FORBIDDEN",
        message: "You are not a member of this room",
      });
      return;
    }
    console.log(socket.data.user);
    // Create message with authenticated user ID
    const createdMessage = await prisma.message.create({
      data: {
        message: data.message.trim(),
        roomId: data.roomId,
        userId: socket.data.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Broadcast to ALL room members (including sender)
    socket.to(data.roomId).emit("new-message-added", createdMessage);
    socket.emit("new-message-added", createdMessage);
  } catch (error) {
    console.error("Error creating message:", error);
    socket.emit("custom-error", {
      code: 500,
      type: "INTERNAL_ERROR",
      message: "Failed to save message",
    });
  }
};

export const clearShapesHandler = async (
  socket: Socket,
  data: { roomId: string },
) => {
  console.log("clearShapesHandler called with data:", data);
  console.log("socket.data.user:", socket.data.user);
  console.log("socket.data.currentRoom:", socket.data.currentRoom);

  // Validate user authentication
  if (!socket.data.user) {
    console.log("User not authenticated");
    socket.emit("custom-error", {
      code: 401,
      type: "UNAUTHORIZED",
      message: "User not authenticated",
    });
    return;
  }

  // Validate roomId
  if (!data.roomId || typeof data.roomId !== "string" || !data.roomId.trim()) {
    socket.emit("custom-error", {
      code: 400,
      type: "INVALID_ROOM_ID",
      message: "Room ID is required and must be a valid string",
    });
    return;
  }

  // Check if user is in the room
  if (socket.data.currentRoom !== data.roomId) {
    socket.emit("custom-error", {
      code: 400,
      type: "NOT_IN_ROOM",
      message: "You are not in this room",
    });
    return;
  }

  try {
    // Verify room exists and user is a member
    const roomMembership = await prisma.roomMember.findFirst({
      where: {
        roomId: data.roomId,
        userId: socket.data.user.id,
      },
      include: {
        room: true,
      },
    });

    if (!roomMembership) {
      socket.emit("custom-error", {
        code: 403,
        type: "FORBIDDEN",
        message: "You are not a member of this room",
      });
      return;
    }

    // All members can clear shapes (no owner/admin check)

    console.log("Clearing shapes for room:", data.roomId);

    // Delete all shapes from the room
    const deletedCount = await prisma.shape.deleteMany({
      where: {
        roomId: data.roomId,
      },
    });

    console.log("Deleted shapes count:", deletedCount);

    // Broadcast to all room members
    socket.to(data.roomId).emit("shapes-cleared", { roomId: data.roomId });
    socket.emit("shapes-cleared", { roomId: data.roomId });

    console.log("Shapes cleared successfully");
  } catch (error) {
    console.error("Error clearing shapes:", error);
    socket.emit("custom-error", {
      code: 500,
      type: "INTERNAL_ERROR",
      message: "Failed to clear shapes",
    });
  }
};
