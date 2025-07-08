import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import axios from 'axios';
import { Room, Message, Member, User } from '../components/dashboard/dashboard.types';

const API_URL = process.env.NEXT_PUBLIC_API_SERVER_URL || "http://localhost:3001";

interface RoomState {
  joinedRooms: Room[];
  overviewRoomId: string | null;
  messages: Message[];
  members: Member[];
  loading: boolean;
  actionLoading: string | null;
  shareDialogOpen: string | null;
  expandedRoom: string | null;
  error: string | null;
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
  toggleRoomExpansion: (roomId: string) => void;
  setShareDialogOpen: (roomId: string | null) => void;
  promoteToAdmin: (roomId: string, userId: string) => Promise<void>;
  demoteFromAdmin: (roomId: string, userId: string) => Promise<void>;
  kickMember: (roomId: string, userId: string) => Promise<void>;
  canManageRoom: (room: Room, user: User | null) => boolean;
  isOwner: (room: Room, user: User | null) => boolean;
  canManageMembers: (room: Room, user: User | null) => boolean;
  getOverviewRoom: () => Room | undefined;
  clearError: () => void;
  setError: (error: string | null) => void;
}

interface RoomStore extends RoomState, RoomActions {}

export const useRoomStore = create<RoomStore>()(
  devtools(
    (set, get) => ({
      joinedRooms: [],
      overviewRoomId: null,
      messages: [],
      members: [],
      loading: false,
      actionLoading: null,
      shareDialogOpen: null,
      expandedRoom: null,
      error: null,

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
        const { overviewRoomId } = get();
        if (!message.trim() || !overviewRoomId) return;
        
        try {
          set({ actionLoading: "sendMessage", error: null });
          const response = await axios.post(`${API_URL}/api/rooms/${overviewRoomId}/messages`, 
            { message: message.trim() },
            { withCredentials: true }
          );

          if (response.status === 201) {
            await get().fetchRoomData(overviewRoomId);
            set({ actionLoading: null });
          }
        } catch (err: any) {
          const errorMessage = err.response?.data?.message || "Failed to send message";
          set({ error: errorMessage, actionLoading: null });
          throw err;
        }
      },

      openOverview: (roomId: string | null) => {
        set({ overviewRoomId: roomId });
        if (roomId) {
          get().fetchRoomData(roomId);
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

      clearError: () => {
        set({ error: null });
      },

      setError: (error: string | null) => {
        set({ error });
      },
    }),
    {
      name: 'room-store',
    }
  )
); 