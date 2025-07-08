import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import axios from 'axios';
import { Room, Message, Member, User } from '../components/dashboard/dashboard.types';

const API_URL = process.env.NEXT_PUBLIC_API_SERVER_URL || "http://localhost:3001";

interface RoomState {
  joinedRooms: Room[];
  selectedRoomId: string | null;
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
  sendMessage: (message: string) => Promise<void>;
  setSelectedRoom: (roomId: string | null) => void;
  toggleRoomExpansion: (roomId: string) => void;
  setShareDialogOpen: (roomId: string | null) => void;
  canManageRoom: (room: Room, user: User | null) => boolean;
  isOwner: (room: Room, user: User | null) => boolean;
  getSelectedRoom: () => Room | undefined;
  clearError: () => void;
  setError: (error: string | null) => void;
}

interface RoomStore extends RoomState, RoomActions {}

export const useRoomStore = create<RoomStore>()(
  devtools(
    (set, get) => ({
      joinedRooms: [],
      selectedRoomId: null,
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
        if (!confirm("Are you sure you want to permanently delete this room? This action cannot be undone.")) return;
        
        try {
          set({ actionLoading: `delete-${roomId}`, error: null });
          const response = await axios.delete(`${API_URL}/api/rooms/${roomId}`, {
            withCredentials: true,
          });

          if (response.status === 200) {
            await get().fetchJoinedRooms();
            const { selectedRoomId } = get();
            if (selectedRoomId === roomId) {
              set({ selectedRoomId: null });
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
        let confirmMessage = `Are you sure you want to leave "${roomName}"?`;
        if (isOwner) {
          confirmMessage += "\n\nAs the owner, your ownership will be transferred to another admin or member.";
        }
        
        if (!confirm(confirmMessage)) return;
        
        try {
          set({ actionLoading: `leave-${roomId}`, error: null });
          const response = await axios.delete(`${API_URL}/api/rooms/${roomId}/leave`, {
            withCredentials: true,
          });

          if (response.status === 200) {
            await get().fetchJoinedRooms();
            const { selectedRoomId } = get();
            if (selectedRoomId === roomId) {
              set({ selectedRoomId: null });
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
        if (!confirm("Do you want to stop sharing this room? New members will no longer be able to join.")) return;
        
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

      sendMessage: async (message: string) => {
        const { selectedRoomId } = get();
        if (!message.trim() || !selectedRoomId) return;
        
        try {
          set({ actionLoading: "sendMessage", error: null });
          const response = await axios.post(`${API_URL}/api/rooms/${selectedRoomId}/messages`, 
            { message: message.trim() },
            { withCredentials: true }
          );

          if (response.status === 201) {
            await get().fetchRoomData(selectedRoomId);
            set({ actionLoading: null });
          }
        } catch (err: any) {
          const errorMessage = err.response?.data?.message || "Failed to send message";
          set({ error: errorMessage, actionLoading: null });
          throw err;
        }
      },

      setSelectedRoom: (roomId: string | null) => {
        set({ selectedRoomId: roomId });
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

      canManageRoom: (room: Room, user: User | null) => {
        return user?.id === room.ownerId || room.userRole === 'ADMIN';
      },

      isOwner: (room: Room, user: User | null) => {
        return user?.id === room.ownerId;
      },

      getSelectedRoom: () => {
        const { joinedRooms, selectedRoomId } = get();
        return joinedRooms.find(room => room.id === selectedRoomId);
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