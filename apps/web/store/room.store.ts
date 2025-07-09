    import { create } from 'zustand';
    import { devtools } from 'zustand/middleware';
    import axios from 'axios';
    import { Room, Message, Member, User } from '../components/dashboard/dashboard.types';
    import { io, Socket } from 'socket.io-client';

    const API_URL = process.env.NEXT_PUBLIC_API_SERVER_URL || "http://localhost:3001";
    const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "http://localhost:3002";
    interface RoomState {
      socket: Socket | null;
      user: User | null;
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
    }

    interface RoomActions {
      fetchJoinedRooms: () => Promise<void>;
      fetchRoomData: (roomId: string) => Promise<void>;
      createRoom: (name: string) => Promise<void>;
      joinRoom: (roomId: string) => Promise<void>;
      deleteRoom: (roomId: string) => Promise<void>;
      leaveRoom: (roomId: string, roomName: string, isOwner: boolean) => Promise<void>;
      shareRoom: (roomId: string) => Promise<void>;
      unshareRoom: (roomId: string) => Promise<void>;
      copyShareLink: (roomId: string) => void;
      copyRoomId: (roomId: string) => void;
      sendMessage: (message: string) => Promise<void>;
      openOverview: (roomId: string | null) => void;
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
      setUser: (user: User | null) => void;
    }

    interface RoomStore extends RoomState, RoomActions {}

    export const useRoomStore = create<RoomStore>()(
      devtools(
        (set, get) => ({
          socket: null,
          user: null,
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

          fetchJoinedRooms: async () => {
            try {
              set({ loading: true, error: null });
              const response = await axios.get(`${API_URL}/api/rooms/joined-rooms`, {
                withCredentials: true,
              });
              
              if (response.data.rooms) {
                set({ joinedRooms: response.data.rooms, loading: false });
              }
            } catch (err: any) {
              const errorMessage = err.response?.data?.message || "Failed to fetch rooms";
              set({ error: errorMessage, loading: false });
              throw err;
            }
          },

          fetchRoomData: async (roomId: string) => {
            try {
              set({ loading: true, error: null });
              const [messagesRes, membersRes] = await Promise.all([
                axios.get(`${API_URL}/api/rooms/${roomId}/messages`, { withCredentials: true }),
                axios.get(`${API_URL}/api/rooms/${roomId}/members`, { withCredentials: true })
              ]);
              
              set({ 
                messages: messagesRes.data.messages || [],
                members: membersRes.data.members || [],
                loading: false
              });
            } catch (err: any) {
              const errorMessage = err.response?.data?.message || "Failed to fetch room data";
              set({ error: errorMessage, loading: false });
              throw err;
            }
          },

          createRoom: async (name: string) => {
            if (!name.trim()) return;
            
            try {
              set({ actionLoading: "create", error: null });
              // http req 
              const response = await axios.post(`${API_URL}/api/rooms`, 
                { name: name.trim() },
                { withCredentials: true }
              );
              
              if (response.status === 201) {
                await get().fetchJoinedRooms();
                set({ actionLoading: null });
              }
            } catch (err: any) {
              const errorMessage = err.response?.data?.message || "Failed to create room";
              set({ error: errorMessage, actionLoading: null });
              throw err;
            }
          },

          joinRoom: async (roomId: string) => {
            if (!roomId.trim()) return;
            
            try {
              set({ actionLoading: "join", error: null });
              // http 
              const response = await axios.post(`${API_URL}/api/rooms/${roomId.trim()}/join`, {}, {
                withCredentials: true,
              });

              if (response.status === 201) {
                await get().fetchJoinedRooms();
                set({ actionLoading: null });
              }
            } catch (err: any) {
              const errorMessage = err.response?.data?.message || "Failed to join room";
              set({ error: errorMessage, actionLoading: null });
              throw err;
            }
          },

          deleteRoom: async (roomId: string) => {
            try {

              set({ actionLoading: `delete-${roomId}`, error: null });
              // http req 
              const response = await axios.delete(`${API_URL}/api/rooms/${roomId}`, {
                withCredentials: true,
              });

              if (response.status === 200) {
                await get().fetchJoinedRooms();
                const { overviewRoomId } = get();
                if (overviewRoomId === roomId) {
                  set({ overviewRoomId: null });
                }
                set({ actionLoading: null });
              }
            } catch (err: any) {
              const errorMessage = err.response?.data?.message || "Failed to delete room";
              set({ error: errorMessage, actionLoading: null });
              throw err;
            }
          },

          leaveRoom: async (roomId: string, roomName: string, isOwner: boolean) => {        
            try {
              set({ actionLoading: `leave-${roomId}`, error: null });
              // http req 
              const response = await axios.delete(`${API_URL}/api/rooms/${roomId}/leave`, {
                withCredentials: true,
              });

              if (response.status === 200) {
                await get().fetchJoinedRooms();
                const { overviewRoomId } = get();
                if (overviewRoomId === roomId) {
                  set({ overviewRoomId: null });
                }
                set({ actionLoading: null });
              }
            } catch (err: any) {
              const errorMessage = err.response?.data?.message || "Failed to leave room";
              set({ error: errorMessage, actionLoading: null });
              throw err;
            }
          },

          shareRoom: async (roomId: string) => {
            try {
              set({ actionLoading: `share-${roomId}`, error: null });
              // http req 
              const response = await axios.patch(`${API_URL}/api/rooms/${roomId}/share`, {}, {
                withCredentials: true,
              });

              if (response.status === 200) {
                await get().fetchJoinedRooms();
                set({ shareDialogOpen: roomId, actionLoading: null });
              }
            } catch (err: any) {
              const errorMessage = err.response?.data?.message || "Failed to share room";
              set({ error: errorMessage, actionLoading: null });
              throw err;
            }
          },

          unshareRoom: async (roomId: string) => {        
            try {
              set({ actionLoading: `unshare-${roomId}`, error: null });
              // http req 
              const response = await axios.patch(`${API_URL}/api/rooms/${roomId}/unshare`, {}, {
                withCredentials: true,
              });

              if (response.status === 200) {
                await get().fetchJoinedRooms();
                set({ actionLoading: null });
              }
            } catch (err: any) {
              const errorMessage = err.response?.data?.message || "Failed to unshare room";
              set({ error: errorMessage, actionLoading: null });
              throw err;
            }
          },

          copyShareLink: (roomId: string) => {
            const shareLink = `${window.location.origin}/room/${roomId}`;
            navigator.clipboard.writeText(shareLink).then(() => {
              // Success handled by notification store
            }).catch(() => {
              const textArea = document.createElement('textarea');
              textArea.value = shareLink;
              document.body.appendChild(textArea);
              textArea.select();
              document.execCommand('copy');
              document.body.removeChild(textArea);
              // Success handled by notification store
            });
          },

          copyRoomId: (roomId: string) => {
            const roomIdText = roomId.toString();
            navigator.clipboard.writeText(roomIdText).then(() => {
              // Success handled by notification store
            }).catch(() => {
              const textArea = document.createElement('textarea');
              textArea.value = roomIdText;
              document.body.appendChild(textArea);
              textArea.select();
              document.execCommand('copy');
              document.body.removeChild(textArea);
              // Success handled by notification store
            });
          },

          sendMessage: async (message: string) => {
            const { overviewRoomId, socket, isConnected, user } = get();

            if (!message || typeof message !== 'string') {
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

            if (!overviewRoomId || typeof overviewRoomId !== 'string') {
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
              socket.emit('new-message', {
                message: trimmedMessage,
                roomId: overviewRoomId,
              });

              set({ error: null });
            } catch (error) {
              console.error('Error sending message:', error);
              set({ error: "Failed to send message!! Refresh the page and try again." });
              
              const currentMessages = get().messages || [];
              const filteredMessages = currentMessages.filter(msg => !msg.id.startsWith('temp-'));
              set({ messages: filteredMessages });
            }
          },

          openOverview: (roomId: string | null) => {
            // ws-server task
            const currentRoomId = get().overviewRoomId;
            if (currentRoomId && get().socket) {
              get().socket?.emit('leave-room', { roomId: currentRoomId });
            }

            set({ overviewRoomId: roomId });

            if (roomId) {
              get().disconnectSocket();
              get().initializeSocket();

              const setupRoomListeners = () => {
                const socket = get().socket;
                if (socket && socket.connected) {
                  socket.on('new-message-added', (newMessage: Message) => {
                    const currentMessages = get().messages || [];
                    const filteredMessages = currentMessages.filter(msg => !msg.id.startsWith('temp-'));
                    set({ messages: [...filteredMessages, newMessage] });
                  });

                  socket.on('user-joined-room', (data: { userId: string, roomId: string, userName: string }) => {
                    if (data.roomId === roomId) {
                      console.log(`${data.userName} joined the room`);
                      const currentOnline = get().onlineMembers;
                      if (!currentOnline.includes(data.userId)) {
                        set({ onlineMembers: [...currentOnline, data.userId] });
                      }
                    }
                  });

                  socket.on('user-left-room', (data: { userId: string, roomId: string, userName: string }) => {
                    if (data.roomId === roomId) {
                      console.log(`${data.userName} left the room`);
                      const currentOnline = get().onlineMembers;
                      set({ onlineMembers: currentOnline.filter(id => id !== data.userId) });
                    }
                  });

                  socket.on('online-members-updated', (data: { roomId: string, onlineMembers: string[] }) => {
                    if (data.roomId === roomId) {
                      set({ onlineMembers: data.onlineMembers });
                    }
                  });

                  socket.on('online-members-list', (data: { roomId: string, onlineMembers: string[] }) => {
                    if (data.roomId === roomId) {
                      set({ onlineMembers: data.onlineMembers });
                    }
                  });

                  socket.on('room-joined', (data: { roomId: string, onlineMembers: string[] }) => {
                    console.log('Successfully joined room:', data.roomId);
                    if (data.onlineMembers) {
                      set({ onlineMembers: data.onlineMembers });
                    }
                    socket.emit('get-online-members', { roomId: data.roomId });
                  });

                  socket.on('custom-error', (error: { code: number, type: string, message: string }) => {
                    console.error('WebSocket error:', error);
                    set({ error: error.message });
                  });

                  socket.on('room-left', (data: { roomId: string }) => {
                    console.log('Successfully left room:', data.roomId);
                    set({ onlineMembers: [] });
                  });

                  socket.emit('join-room', { roomId });
                } else {
                  setTimeout(setupRoomListeners, 100);
                }
              };

              setupRoomListeners();
              get().fetchRoomData(roomId);
            } else {
              get().disconnectSocket();
            }
          },

          closeOverview: () => {
            const currentRoomId = get().overviewRoomId;
            if (currentRoomId && get().socket && get().isConnected) {
              get().socket?.emit('leave-room', { roomId: currentRoomId });
              
              set({ overviewRoomId: null });
              
              // Delay disconnect slightly to ensure leave-room event is processed
              setTimeout(() => {
                get().disconnectSocket();
              }, 100);
            } else {
              set({ overviewRoomId: null });
              get().disconnectSocket();
            }
          },

          initializeSocket: () => {
            if (get().socket) {
              get().disconnectSocket();
            }
            
            try {
              const socket = io(WEBSOCKET_URL, {
                withCredentials: true,
                transports: ['websocket', 'polling'],
                timeout: 10000,
                forceNew: true,
              });

              set({ socket: socket, isConnected: false });

              socket.on('connect', () => {
                console.log('Socket connected');
                set({ isConnected: true, error: null });
              });

              socket.on('disconnect', (reason) => {
                console.log('Socket disconnected:', reason);
                set({ isConnected: false });
              });

              socket.on('connect_error', (error) => {
                console.error('WebSocket connection error:', error);
                set({ isConnected: false, error: 'Failed to connect to chat server' });
              });

              socket.on('online-members', (members: string[]) => {
                set({ onlineMembers: members });
              });

              socket.on('error', (error) => {
                console.error('Socket error:', error);
                set({ error: error.message || 'WebSocket error occurred' });
              });
            } catch (error) {
              console.error('Failed to initialize socket:', error);
              set({ error: 'Failed to initialize chat connection' });
            }
          },

          disconnectSocket: () => {
            const socket = get().socket;
            if (socket) {
              socket.removeAllListeners();
              socket.disconnect();
              set({ socket: null, isConnected: false, onlineMembers: [] });
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
              const response = await axios.patch(`${API_URL}/api/rooms/${roomId}/members/${userId}/promote`, {}, {
                withCredentials: true,
              });

              if (response.status === 200) {
                await get().fetchRoomData(roomId);
                set({ actionLoading: null });
              }
            } catch (err: any) {
              const errorMessage = err.response?.data?.message || "Failed to promote member";
              set({ error: errorMessage, actionLoading: null });
              throw err;
            }
          },

          demoteFromAdmin: async (roomId: string, userId: string) => {
            try {
              set({ actionLoading: `demote-${userId}`, error: null });
              const response = await axios.patch(`${API_URL}/api/rooms/${roomId}/members/${userId}/demote`, {}, {
                withCredentials: true,
              });

              if (response.status === 200) {
                await get().fetchRoomData(roomId);
                set({ actionLoading: null });
              }
            } catch (err: any) {
              const errorMessage = err.response?.data?.message || "Failed to demote admin";
              set({ error: errorMessage, actionLoading: null });
              throw err;
            }
          },

          kickMember: async (roomId: string, userId: string) => {
            try {
              set({ actionLoading: `kick-${userId}`, error: null });
              const response = await axios.delete(`${API_URL}/api/rooms/${roomId}/members/${userId}`, {
                withCredentials: true,
              });

              if (response.status === 200) {
                await get().fetchRoomData(roomId);
                set({ actionLoading: null });
              }
            } catch (err: any) {
              const errorMessage = err.response?.data?.message || "Failed to kick member";
              set({ error: errorMessage, actionLoading: null });
              throw err;
            }
          },

          canManageRoom: (room: Room, user: User | null) => {
            return user?.id === room.ownerId || room.userRole === 'ADMIN';
          },

          isOwner: (room: Room, user: User | null) => {
            return user?.id === room.ownerId;
          },

          canManageMembers: (room: Room, user: User | null) => {
            return user?.id === room.ownerId || room.userRole === 'ADMIN';
          },

          getOverviewRoom: () => {
            const { joinedRooms, overviewRoomId } = get();
            return joinedRooms.find(room => room.id === overviewRoomId);
          },

          setUser: (user: User | null) => {
            set({ user });
          },
        }),
        {
          name: 'room-store',
        }
      )
    ); 