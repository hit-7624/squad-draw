import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  Room,
  Message,
  Member,
  User,
} from "@/components/dashboard/dashboard.types";
import { io, Socket } from "socket.io-client";
import { ShapeType } from "@/schemas/index";

const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL;

interface DrawnShape {
  id?: string;
  type: ShapeType;
  dataFromRoughJs: any;
  style?: any;
  creatorId?: string;
  roomId?: string;
}

interface RoomState {
  socket: Socket | null;
  joinedRooms: Room[];
  overviewRoomId: string | null;
  messages: Message[];
  members: Member[];
  loading: boolean;
  actionLoading: string | null;
  shareDialogOpen: string | null;
  expandedRoom: string | null;
  error: string | null;
  isConnected: boolean;
  onlineMembers: string[];
  shapes: DrawnShape[];
}

interface RoomActions {
  fetchJoinedRooms: () => Promise<void>;
  fetchRoomData: (roomId: string) => Promise<void>;
  createRoom: (name: string) => Promise<void>;
  joinRoom: (roomId: string) => Promise<void>;
  deleteRoom: (roomId: string) => Promise<void>;
  leaveRoom: (
    roomId: string,
    roomName: string,
    isOwner: boolean,
  ) => Promise<void>;
  shareRoom: (roomId: string) => Promise<void>;
  unshareRoom: (roomId: string) => Promise<void>;
  copyShareLink: (roomId: string) => void;
  copyRoomId: (roomId: string) => void;
  sendMessage: (message: string, user?: User) => Promise<void>;
  openOverview: (roomId: string | null) => void;
  openOverviewWithoutSocket: (roomId: string | null) => void;
  closeOverview: () => void;
  initializeSocket: () => void;
  disconnectSocket: () => void;
  toggleRoomExpansion: (roomId: string) => void;
  setShareDialogOpen: (roomId: string | null) => void;
  promoteToAdmin: (roomId: string, userId: string) => Promise<void>;
  demoteFromAdmin: (roomId: string, userId: string) => Promise<void>;
  kickMember: (roomId: string, userId: string) => Promise<void>;
  canManageRoom: (room: Room, user: User | null) => boolean;
  isOwner: (room: Room, user: User | null) => boolean;
  canManageMembers: (room: Room, user: User | null) => boolean;
  getOverviewRoom: () => Room | undefined;
  canManageCurrentRoom: (user: User | null) => boolean;
  fetchCurrentRoomData: (roomId: string) => Promise<void>;
  addShape: (shape: DrawnShape, userId?: string) => void;
  clearShapes: () => Promise<void>;
  fetchShapes: (roomId: string) => Promise<void>;
  saveAndBroadcastShape: (shape: DrawnShape, userId: string) => Promise<void>;
}

interface RoomStore extends RoomState, RoomActions {}

export const useRoomStore = create<RoomStore>()(
  devtools(
    (set, get) => ({
      socket: null,
      joinedRooms: [],
      overviewRoomId: null,
      messages: [],
      members: [],
      loading: false,
      actionLoading: null,
      shareDialogOpen: null,
      expandedRoom: null,
      error: null,
      isConnected: false,
      onlineMembers: [],
      shapes: [],

      fetchJoinedRooms: async () => {
        try {
          set({ loading: true, error: null });
          const response = await fetch("/api/rooms", {
            credentials: "include",
          });

          if (response.ok) {
            const data = await response.json();
            set({ joinedRooms: data.rooms || [], loading: false });
          } else {
            throw new Error("Failed to fetch rooms");
          }
        } catch (err: any) {
          const errorMessage = err.message || "Failed to fetch rooms";
          set({ error: errorMessage, loading: false });
          throw err;
        }
      },

      fetchRoomData: async (roomId: string) => {
        try {
          set({ loading: true, error: null });
          const [messagesRes, membersRes] = await Promise.all([
            fetch(`/api/rooms/${roomId}/messages`, { credentials: "include" }),
            fetch(`/api/rooms/${roomId}/members`, { credentials: "include" }),
          ]);

          if (messagesRes.ok && membersRes.ok) {
            const [messagesData, membersData] = await Promise.all([
              messagesRes.json(),
              membersRes.json(),
            ]);

            set({
              messages: messagesData.messages || [],
              members: membersData.members || [],
              loading: false,
            });
          } else {
            throw new Error("Failed to fetch room data");
          }
        } catch (err: any) {
          const errorMessage = err.message || "Failed to fetch room data";
          set({ error: errorMessage, loading: false });
          throw err;
        }
      },

      createRoom: async (name: string) => {
        if (!name.trim()) return;

        try {
          set({ actionLoading: "create", error: null });
          const response = await fetch("/api/rooms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: name.trim() }),
            credentials: "include",
          });

          if (response.ok) {
            await get().fetchJoinedRooms();
            set({ actionLoading: null });
          } else {
            const error = await response.json();
            throw new Error(error.error || "Failed to create room");
          }
        } catch (err: any) {
          const errorMessage = err.message || "Failed to create room";
          set({ error: errorMessage, actionLoading: null });
          throw err;
        }
      },

      joinRoom: async (roomId: string) => {
        if (!roomId.trim()) return;

        try {
          set({ actionLoading: "join", error: null });
          const response = await fetch(`/api/rooms/${roomId.trim()}/join`, {
            method: "POST",
            credentials: "include",
          });

          if (response.ok) {
            await get().fetchJoinedRooms();
            set({ actionLoading: null });
          } else {
            const error = await response.json();
            throw new Error(error.error || "Failed to join room");
          }
        } catch (err: any) {
          const errorMessage = err.message || "Failed to join room";
          set({ error: errorMessage, actionLoading: null });
          throw err;
        }
      },

      deleteRoom: async (roomId: string) => {
        try {
          set({ actionLoading: `delete-${roomId}`, error: null });
          const response = await fetch(`/api/rooms/${roomId}`, {
            method: "DELETE",
            credentials: "include",
          });

          if (response.ok) {
            await get().fetchJoinedRooms();
            const { overviewRoomId } = get();
            if (overviewRoomId === roomId) {
              set({ overviewRoomId: null });
            }
            set({ actionLoading: null });
          } else {
            const error = await response.json();
            throw new Error(error.error || "Failed to delete room");
          }
        } catch (err: any) {
          const errorMessage = err.message || "Failed to delete room";
          set({ error: errorMessage, actionLoading: null });
          throw err;
        }
      },

      leaveRoom: async (roomId: string, roomName: string, isOwner: boolean) => {
        try {
          set({ actionLoading: `leave-${roomId}`, error: null });
          const response = await fetch(`/api/rooms/${roomId}/leave`, {
            method: "DELETE",
            credentials: "include",
          });

          if (response.ok) {
            await get().fetchJoinedRooms();
            const { overviewRoomId } = get();
            if (overviewRoomId === roomId) {
              set({ overviewRoomId: null });
            }
            set({ actionLoading: null });
          } else {
            const error = await response.json();
            throw new Error(error.error || "Failed to leave room");
          }
        } catch (err: any) {
          const errorMessage = err.message || "Failed to leave room";
          set({ error: errorMessage, actionLoading: null });
          throw err;
        }
      },

      shareRoom: async (roomId: string) => {
        try {
          set({ actionLoading: `share-${roomId}`, error: null });
          const response = await fetch(`/api/rooms/${roomId}/share`, {
            method: "PATCH",
            credentials: "include",
          });

          if (response.ok) {
            await get().fetchJoinedRooms();
            set({ shareDialogOpen: roomId, actionLoading: null });
          } else {
            const error = await response.json();
            throw new Error(error.error || "Failed to share room");
          }
        } catch (err: any) {
          const errorMessage = err.message || "Failed to share room";
          set({ error: errorMessage, actionLoading: null });
          throw err;
        }
      },

      unshareRoom: async (roomId: string) => {
        try {
          set({ actionLoading: `unshare-${roomId}`, error: null });
          const response = await fetch(`/api/rooms/${roomId}/unshare`, {
            method: "PATCH",
            credentials: "include",
          });

          if (response.ok) {
            await get().fetchJoinedRooms();
            set({ actionLoading: null });
          } else {
            const error = await response.json();
            throw new Error(error.error || "Failed to unshare room");
          }
        } catch (err: any) {
          const errorMessage = err.message || "Failed to unshare room";
          set({ error: errorMessage, actionLoading: null });
          throw err;
        }
      },

      copyShareLink: (roomId: string) => {
        const shareLink = `${window.location.origin}/room/${roomId}`;
        navigator.clipboard
          .writeText(shareLink)
          .then(() => {
            // Success handled by notification store
          })
          .catch(() => {
            const textArea = document.createElement("textarea");
            textArea.value = shareLink;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            // Success handled by notification store
          });
      },

      copyRoomId: (roomId: string) => {
        const roomIdText = roomId.toString();
        navigator.clipboard
          .writeText(roomIdText)
          .then(() => {
            // Success handled by notification store
          })
          .catch(() => {
            const textArea = document.createElement("textarea");
            textArea.value = roomIdText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            // Success handled by notification store
          });
      },

      sendMessage: async (message: string, user?: User) => {
        const { overviewRoomId, socket, isConnected } = get();

        if (!message || typeof message !== "string") {
          set({ error: "Invalid message format" });
          return;
        }

        const trimmedMessage = message.trim();

        if (!trimmedMessage) {
          set({ error: "Message cannot be empty" });
          return;
        }

        if (trimmedMessage.length > 1000) {
          set({ error: "Message cannot exceed 1000 characters" });
          return;
        }

        if (!overviewRoomId || typeof overviewRoomId !== "string") {
          set({ error: "No room selected for messaging" });
          return;
        }

        if (!socket || !isConnected) {
          set({ error: "Not connected to chat server" });
          return;
        }

        if (!user) {
          set({ error: "User not authenticated" });
          return;
        }

        try {
          const tempMessage: Message = {
            id: `temp-${Date.now()}`,
            message: trimmedMessage,
            createdAt: new Date().toISOString(),
            user: user,
            roomId: overviewRoomId,
            userId: user.id,
          };

          const currentMessages = get().messages || [];
          set({ messages: [...currentMessages, tempMessage] });

          // Send
          socket.emit("new-message", {
            message: trimmedMessage,
            roomId: overviewRoomId,
          });

          set({ error: null });
        } catch (error) {
          console.error("Error sending message:", error);
          set({
            error: "Failed to send message!! Refresh the page and try again.",
          });

          const currentMessages = get().messages || [];
          const filteredMessages = currentMessages.filter(
            (msg) => !msg.id.startsWith("temp-"),
          );
          set({ messages: filteredMessages });
        }
      },

      openOverview: (roomId: string | null) => {
        // ws-server task
        const currentRoomId = get().overviewRoomId;
        if (currentRoomId && get().socket) {
          get().socket?.emit("leave-room", { roomId: currentRoomId });
        }

        set({ overviewRoomId: roomId });

        if (roomId) {
          get().disconnectSocket();
          get().initializeSocket();

          const setupRoomListeners = () => {
            const socket = get().socket;
            if (socket && socket.connected) {
              socket.on("new-message-added", (newMessage: Message) => {
                const currentMessages = get().messages || [];
                const filteredMessages = currentMessages.filter(
                  (msg) => !msg.id.startsWith("temp-"),
                );
                set({ messages: [...filteredMessages, newMessage] });
              });

              socket.on(
                "user-joined-room",
                (data: {
                  userId: string;
                  roomId: string;
                  userName: string;
                }) => {
                  if (data.roomId === roomId) {
                    console.log(`${data.userName} joined the room`);
                    const currentOnline = get().onlineMembers;
                    if (!currentOnline.includes(data.userId)) {
                      set({ onlineMembers: [...currentOnline, data.userId] });
                    }
                  }
                },
              );

              socket.on(
                "user-left-room",
                (data: {
                  userId: string;
                  roomId: string;
                  userName: string;
                }) => {
                  if (data.roomId === roomId) {
                    console.log(`${data.userName} left the room`);
                    const currentOnline = get().onlineMembers;
                    set({
                      onlineMembers: currentOnline.filter(
                        (id) => id !== data.userId,
                      ),
                    });
                  }
                },
              );

              socket.on(
                "online-members-updated",
                (data: { roomId: string; onlineMembers: string[] }) => {
                  if (data.roomId === roomId) {
                    set({ onlineMembers: data.onlineMembers });
                  }
                },
              );

              socket.on(
                "online-members-list",
                (data: { roomId: string; onlineMembers: string[] }) => {
                  if (data.roomId === roomId) {
                    set({ onlineMembers: data.onlineMembers });
                  }
                },
              );

              socket.on("new-shape-added", (newShape: DrawnShape) => {
                const currentShapes = get().shapes || [];
                set({ shapes: [...currentShapes, newShape] });
              });

              socket.on("shapes-cleared", (data: { roomId: string }) => {
                if (data.roomId === roomId) {
                  set({ shapes: [] });
                }
              });

              socket.on(
                "room-joined",
                (data: { roomId: string; onlineMembers: string[] }) => {
                  console.log("Successfully joined room:", data.roomId);
                  if (data.onlineMembers) {
                    set({ onlineMembers: data.onlineMembers });
                  }
                  socket.emit("get-online-members", { roomId: data.roomId });
                  // Fetch shapes when joining room
                  get().fetchShapes(data.roomId);
                },
              );

              socket.on(
                "custom-error",
                (error: { code: number; type: string; message: string }) => {
                  console.error("WebSocket error:", error);
                  set({ error: error.message });
                },
              );

              socket.on("room-left", (data: { roomId: string }) => {
                console.log("Successfully left room:", data.roomId);
                set({ onlineMembers: [] });
              });

              socket.emit("join-room", { roomId });
            } else {
              setTimeout(setupRoomListeners, 100);
            }
          };

          setupRoomListeners();
          get().fetchRoomData(roomId);
          get().fetchCurrentRoomData(roomId);
        } else {
          get().disconnectSocket();
        }
      },

      openOverviewWithoutSocket: (roomId: string | null) => {
        set({ overviewRoomId: roomId });

        if (roomId) {
          get().fetchRoomData(roomId);
          get().fetchCurrentRoomData(roomId);
        }
      },

      closeOverview: () => {
        const currentRoomId = get().overviewRoomId;
        if (currentRoomId && get().socket && get().isConnected) {
          get().socket?.emit("leave-room", { roomId: currentRoomId });

          set({ overviewRoomId: null });

          setTimeout(() => {
            get().disconnectSocket();
          }, 100);
        } else {
          set({ overviewRoomId: null });
          get().disconnectSocket();
        }
      },

      initializeSocket: () => {
        console.log("initializeSocket called");
        const currentSocket = get().socket;
        if (currentSocket?.connected) {
          console.log("Socket already connected, skipping initialization");
          return; // Already connected
        }

        try {
          // Clean up existing socket if any
          if (currentSocket) {
            console.log("Cleaning up existing socket");
            currentSocket.removeAllListeners();
            currentSocket.disconnect();
          }

          console.log("Creating new socket connection to:", WEBSOCKET_URL);
          const socket = io(WEBSOCKET_URL, {
            withCredentials: true,
            transports: ["websocket", "polling"],
            timeout: 10000,
            forceNew: true,
          });

          // Set up event listeners before setting socket in state
          socket.on("connect", () => {
            console.log("Socket connected successfully");
            set({ isConnected: true, error: null });
          });

          socket.on("disconnect", (reason) => {
            console.log("Socket disconnected:", reason);
            set({ isConnected: false });
          });

          socket.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
            set({
              isConnected: false,
              error: "Failed to connect to chat server",
            });
          });

          socket.on("new-shape-added", (newShape: DrawnShape) => {
            console.log("Received new shape:", newShape);
            // We'll handle the user ID check in the component that calls addShape
            set((state) => ({
              shapes: [...state.shapes, newShape],
            }));
          });

          socket.on("shapes-cleared", (data: { roomId: string }) => {
            console.log("Shapes cleared for room:", data.roomId);
            set({ shapes: [] });
          });

          socket.on(
            "room-joined",
            async (data: { roomId: string; onlineMembers: string[] }) => {
              console.log("Successfully joined room:", data.roomId);
              set({ onlineMembers: data.onlineMembers || [] });
              socket.emit("get-online-members", { roomId: data.roomId });

              try {
                await get().fetchShapes(data.roomId);
              } catch (error) {
                console.error("Error fetching shapes:", error);
              }
            },
          );

          socket.on(
            "custom-error",
            (error: { code: number; type: string; message: string }) => {
              console.error("WebSocket custom error:", error);
              set({ error: error.message });
            },
          );

          // Set socket in state after all listeners are set up
          console.log("Setting socket in state");
          set({ socket, isConnected: false, error: null });
        } catch (error) {
          console.error("Failed to initialize socket:", error);
          set({
            socket: null,
            isConnected: false,
            error: "Failed to initialize chat connection",
          });
        }
      },

      disconnectSocket: () => {
        const socket = get().socket;
        if (!socket) return;

        try {
          // First remove all listeners
          socket.removeAllListeners();

          // Then disconnect the socket
          socket.disconnect();

          // Update state with partial state update
          set((state) => ({
            ...state,
            socket: null,
            isConnected: false,
            onlineMembers: [],
            shapes: [],
            error: null,
            overviewRoomId: null,
          }));
        } catch (error) {
          console.error("Error during socket disconnection:", error);
        }
      },

      toggleRoomExpansion: (roomId: string) => {
        const { expandedRoom } = get();
        set({ expandedRoom: expandedRoom === roomId ? null : roomId });
      },

      setShareDialogOpen: (roomId: string | null) => {
        set({ shareDialogOpen: roomId });
      },

      promoteToAdmin: async (roomId: string, userId: string) => {
        try {
          set({ actionLoading: `promote-${userId}`, error: null });
          const response = await fetch(
            `/api/rooms/${roomId}/members/${userId}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "promote" }),
              credentials: "include",
            },
          );

          if (response.ok) {
            await get().fetchRoomData(roomId);
            set({ actionLoading: null });
          } else {
            const error = await response.json();
            throw new Error(error.error || "Failed to promote member");
          }
        } catch (err: any) {
          const errorMessage = err.message || "Failed to promote member";
          set({ error: errorMessage, actionLoading: null });
          throw err;
        }
      },

      demoteFromAdmin: async (roomId: string, userId: string) => {
        try {
          set({ actionLoading: `demote-${userId}`, error: null });
          const response = await fetch(
            `/api/rooms/${roomId}/members/${userId}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "demote" }),
              credentials: "include",
            },
          );

          if (response.ok) {
            await get().fetchRoomData(roomId);
            set({ actionLoading: null });
          } else {
            const error = await response.json();
            throw new Error(error.error || "Failed to demote admin");
          }
        } catch (err: any) {
          const errorMessage = err.message || "Failed to demote admin";
          set({ error: errorMessage, actionLoading: null });
          throw err;
        }
      },

      kickMember: async (roomId: string, userId: string) => {
        try {
          set({ actionLoading: `kick-${userId}`, error: null });
          const response = await fetch(
            `/api/rooms/${roomId}/members/${userId}`,
            {
              method: "DELETE",
              credentials: "include",
            },
          );

          if (response.ok) {
            await get().fetchRoomData(roomId);
            set({ actionLoading: null });
          } else {
            const error = await response.json();
            throw new Error(error.error || "Failed to kick member");
          }
        } catch (err: any) {
          const errorMessage = err.message || "Failed to kick member";
          set({ error: errorMessage, actionLoading: null });
          throw err;
        }
      },

      canManageRoom: (room: Room, user: User | null) => {
        return user?.id === room.owner.id || room.userRole === "ADMIN";
      },

      isOwner: (room: Room, user: User | null) => {
        return user?.id === room.owner.id;
      },

      canManageMembers: (room: Room, user: User | null) => {
        return user?.id === room.owner.id || room.userRole === "ADMIN";
      },

      getOverviewRoom: () => {
        const { joinedRooms, overviewRoomId } = get();
        return joinedRooms.find((room) => room.id === overviewRoomId);
      },

      canManageCurrentRoom: (user: User | null) => {
        const room = get().getOverviewRoom();
        console.log("canManageCurrentRoom check:", { user, room });
        if (!room || !user) {
          console.log("canManageCurrentRoom: No room or user");
          return false;
        }
        const canManage = get().canManageRoom(room, user);
        console.log("canManageCurrentRoom result:", canManage, {
          userRole: room.userRole,
          ownerId: room.owner.id,
          userId: user.id,
        });
        return canManage;
      },

      fetchCurrentRoomData: async (roomId: string) => {
        try {
          const response = await fetch(`/api/rooms/${roomId}`, {
            credentials: "include",
          });

          if (response.ok) {
            const roomData = await response.json();
            console.log("Fetched room data:", roomData);

            // Always update joinedRooms with the latest room data
            set((state) => {
              const updatedRooms = state.joinedRooms.some((r) => r.id === roomId)
                ? state.joinedRooms.map((r) =>
                    r.id === roomId ? roomData.room : r
                  )
                : [...state.joinedRooms, roomData.room];
              return { joinedRooms: updatedRooms };
            });
          }
        } catch (error) {
          console.error("Error fetching room data:", error);
        }
      },

      addShape: (shape: DrawnShape, userId?: string) => {
        console.log("addShape called with:", shape);
        const socket = get().socket;
        const currentRoomId = get().overviewRoomId;

        console.log(
          "addShape - socket:",
          !!socket,
          "user:",
          !!userId,
          "isConnected:",
          get().isConnected,
        );

        if (!socket || !userId || !currentRoomId) {
          console.error("Socket, user, or room not available for addShape");
          return;
        }

        // Add shape to local state
        console.log("Adding shape to local state");
        set((state) => ({ shapes: [...state.shapes, shape] }));

        // Emit to websocket server
        console.log("Emitting new-shape event:", shape);
        socket.emit("new-shape", {
          ...shape,
          roomId: currentRoomId,
          creatorId: userId,
        });
      },

      saveAndBroadcastShape: async (shape: DrawnShape, userId: string) => {
        try {
          const currentRoomId = get().overviewRoomId;
          if (!currentRoomId) {
            console.error("No room ID available");
            return;
          }
          get().addShape({ ...shape, roomId: currentRoomId, creatorId: userId }, userId);
          const response = await fetch(`/api/rooms/${currentRoomId}/shapes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: shape.type,
              dataFromRoughJs: shape.dataFromRoughJs,
              style: shape.style || {},
            }),
            credentials: "include",
          });
          if (!response.ok) {
            // Optionally: use notification store or toast
            console.error("Failed to save shape");
            return;
          }
          const { shape: savedShape } = await response.json();
        } catch (error) {
          // Optionally: use notification store or toast
          console.error("Error saving shape:", error);
        }
      },

      clearShapes: async () => {
        const socket = get().socket;
        const currentRoomId = get().overviewRoomId;

        console.log("clearShapes called:", {
          socket: !!socket,
          currentRoomId,
          isConnected: get().isConnected,
          socketConnected: socket?.connected,
          socketId: socket?.id,
        });

        // Clear local state immediately for better UX
        set({ shapes: [] });

        if (socket && currentRoomId && get().isConnected) {
          console.log("Emitting clear-shapes event to room:", currentRoomId);
          socket.emit("clear-shapes", { roomId: currentRoomId });

          // Add a callback to check if the event was received
          socket.on("shapes-cleared", (data) => {
            console.log("Received shapes-cleared confirmation:", data);
            set({ shapes: [] });
          });

          socket.on("custom-error", (error) => {
            console.error("Received custom error:", error);
          });
        } else {
          console.log("Socket not available, using API fallback");
          // Fallback to API call if websocket is not available
          try {
            const response = await fetch(`/api/rooms/${currentRoomId}/shapes`, {
              method: "DELETE",
              credentials: "include",
            });

            if (!response.ok) {
              console.error("Failed to clear shapes via API");
              // Revert local state if API call fails
              const shapesResponse = await fetch(
                `/api/rooms/${currentRoomId}/shapes`,
                {
                  credentials: "include",
                },
              );
              if (shapesResponse.ok) {
                const data = await shapesResponse.json();
                set({ shapes: data.shapes || [] });
              }
            }
          } catch (error) {
            console.error("Error clearing shapes via API:", error);
          }
        }
      },

      fetchShapes: async (roomId: string) => {
        try {
          set({ loading: true, error: null });
          const response = await fetch(`/api/rooms/${roomId}/shapes`, {
            credentials: "include",
          });

          if (response.ok) {
            const data = await response.json();
            set({ shapes: data.shapes || [], loading: false });
          } else {
            throw new Error("Failed to fetch shapes");
          }
        } catch (err: any) {
          const errorMessage = err.message || "Failed to fetch shapes";
          set({ error: errorMessage, loading: false });
          throw err;
        }
      },
    }),
    {
      name: "room-store",
    },
  ),
);
