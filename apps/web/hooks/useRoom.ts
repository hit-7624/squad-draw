import { useRoomStore } from '../store/room.store';

export const useRoom = () => {
  const joinedRooms = useRoomStore((state) => state.joinedRooms);
  const selectedRoomId = useRoomStore((state) => state.selectedRoomId);
  const messages = useRoomStore((state) => state.messages);
  const members = useRoomStore((state) => state.members);
  const loading = useRoomStore((state) => state.loading);
  const actionLoading = useRoomStore((state) => state.actionLoading);
  const shareDialogOpen = useRoomStore((state) => state.shareDialogOpen);
  const expandedRoom = useRoomStore((state) => state.expandedRoom);
  const error = useRoomStore((state) => state.error);

  const fetchJoinedRooms = useRoomStore((state) => state.fetchJoinedRooms);
  const fetchRoomData = useRoomStore((state) => state.fetchRoomData);
  const createRoom = useRoomStore((state) => state.createRoom);
  const joinRoom = useRoomStore((state) => state.joinRoom);
  const deleteRoom = useRoomStore((state) => state.deleteRoom);
  const leaveRoom = useRoomStore((state) => state.leaveRoom);
  const shareRoom = useRoomStore((state) => state.shareRoom);
  const unshareRoom = useRoomStore((state) => state.unshareRoom);
  const copyShareLink = useRoomStore((state) => state.copyShareLink);
  const sendMessage = useRoomStore((state) => state.sendMessage);
  const setSelectedRoom = useRoomStore((state) => state.setSelectedRoom);
  const toggleRoomExpansion = useRoomStore((state) => state.toggleRoomExpansion);
  const setShareDialogOpen = useRoomStore((state) => state.setShareDialogOpen);
  const canManageRoom = useRoomStore((state) => state.canManageRoom);
  const isOwner = useRoomStore((state) => state.isOwner);
  const getSelectedRoom = useRoomStore((state) => state.getSelectedRoom);
  const clearError = useRoomStore((state) => state.clearError);
  const setError = useRoomStore((state) => state.setError);

  return {
    // State
    joinedRooms,
    selectedRoomId,
    messages,
    members,
    loading,
    actionLoading,
    shareDialogOpen,
    expandedRoom,
    error,
    
    // Actions
    fetchJoinedRooms,
    fetchRoomData,
    createRoom,
    joinRoom,
    deleteRoom,
    leaveRoom,
    shareRoom,
    unshareRoom,
    copyShareLink,
    sendMessage,
    setSelectedRoom,
    toggleRoomExpansion,
    setShareDialogOpen,
    canManageRoom,
    isOwner,
    getSelectedRoom,
    clearError,
    setError,
  };
}; 