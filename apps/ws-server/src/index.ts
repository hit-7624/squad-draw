import { Server, Socket } from "socket.io";
import { createServer } from "http";
import dotenv from "dotenv";
import path from "path";
import { authMiddleware } from "./middlewares/auth.middleware";
import {
  joinRoomHandler,
  leaveRoomHandler,
  getOnlineMembersHandler,
} from "./handlers/connection.handlers";
import {
  newMessageHandler,
  newShapeHandler,
  clearShapesHandler,
} from "./handlers/content.handlers";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: process.env.ORIGIN_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.use(authMiddleware);

// generl error handling
const handleSocketEvent = async (
  socket: Socket,
  eventName: string,
  handler: (socket: Socket, data: any) => Promise<void>,
  data: any,
) => {
  try {
    await handler(socket, data);
  } catch (error) {
    console.error(`Error in ${eventName} event:`, error);
    socket.emit("custom-error", {
      code: 500,
      type: "INTERNAL_ERROR",
      message: `Failed to ${eventName.replace("-", " ")}`,
    });
  }
};

io.on("connection", (socket: Socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join-room", async (data) => {
    await handleSocketEvent(socket, "join-room", joinRoomHandler, data);
  });

  socket.on("leave-room", async (data) => {
    await handleSocketEvent(socket, "leave-room", leaveRoomHandler, data);
  });

  socket.on("get-online-members", async (data) => {
    await handleSocketEvent(
      socket,
      "get-online-members",
      getOnlineMembersHandler,
      data,
    );
  });

  socket.on("new-shape", async (data) => {
    await handleSocketEvent(socket, "new-shape", newShapeHandler, data);
  });

  socket.on("new-message", async (data) => {
    await handleSocketEvent(socket, "new-message", newMessageHandler, data);
  });

  socket.on("clear-shapes", async (data) => {
    console.log(
      "Received clear-shapes event from client:",
      socket.id,
      "with data:",
      data,
    );
    await handleSocketEvent(socket, "clear-shapes", clearShapesHandler, data);
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });

  socket.on("disconnect", async () => {
    console.log("Client disconnected:", socket.id);

    if (socket.data.currentRoom) {
      await handleSocketEvent(socket, "leave-room", leaveRoomHandler, {
        roomId: socket.data.currentRoom,
      });
    }
  });
});

io.engine.on("connection_error", (error) => {
  console.error("Connection error:", error);
});

httpServer.listen(process.env.WS_SERVER_PORT, () => {
  console.log(
    `WebSocket server is running on port ${process.env.WS_SERVER_PORT}`,
  );
});
