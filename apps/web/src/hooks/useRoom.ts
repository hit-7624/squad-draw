import { useRoomStore } from '@/store/room.store';

export const useRoom = () => {
  const joinedRooms = useRoomStore((state) => state.joinedRooms);
  const overviewRoomId = useRoomStore((state) => state.overviewRoomId);
  const messages = useRoomStore((state) => state.messages);
  const members = useRoomStore((state) => state.members);
  const loading = useRoomStore((state) => state.loading);
  const actionLoading = useRoomStore((state) => state.actionLoading);
  const shareDialogOpen = useRoomStore((state) => state.shareDialogOpen);
  const expandedRoom = useRoomStore((state) => state.expandedRoom);
  const error = useRoomStore((state) => state.error);
  const isConnected = useRoomStore((state) => state.isConnected);
  const onlineMembers = useRoomStore((state) => state.onlineMembers);

  const fetchJoinedRooms = useRoomStore((state) => state.fetchJoinedRooms);
  const fetchRoomData = useRoomStore((state) => state.fetchRoomData);
  const createRoom = useRoomStore((state) => state.createRoom);
  const joinRoom = useRoomStore((state) => state.joinRoom);
  const deleteRoom = useRoomStore((state) => state.deleteRoom);
  const leaveRoom = useRoomStore((state) => state.leaveRoom);
  const shareRoom = useRoomStore((state) => state.shareRoom);
  const unshareRoom = useRoomStore((state) => state.unshareRoom);
  const copyShareLink = useRoomStore((state) => state.copyShareLink);
  const copyRoomId = useRoomStore((state) => state.copyRoomId);
  const sendMessage = useRoomStore((state) => state.sendMessage);
  const openOverview = useRoomStore((state) => state.openOverview);
  const closeOverview = useRoomStore((state) => state.closeOverview);
  const initializeSocket = useRoomStore((state) => state.initializeSocket);
  const disconnectSocket = useRoomStore((state) => state.disconnectSocket);
  const toggleRoomExpansion = useRoomStore((state) => state.toggleRoomExpansion);
  const setShareDialogOpen = useRoomStore((state) => state.setShareDialogOpen);
  const promoteToAdmin = useRoomStore((state) => state.promoteToAdmin);
  const demoteFromAdmin = useRoomStore((state) => state.demoteFromAdmin);
  const kickMember = useRoomStore((state) => state.kickMember);
  const canManageRoom = useRoomStore((state) => state.canManageRoom);
  const isOwner = useRoomStore((state) => state.isOwner);
  const canManageMembers = useRoomStore((state) => state.canManageMembers);
  const getOverviewRoom = useRoomStore((state) => state.getOverviewRoom);
  const setUser = useRoomStore((state) => state.setUser);

  return {
    joinedRooms,
    overviewRoomId,
    messages,
    members,
    loading,
    actionLoading,
    shareDialogOpen,
    expandedRoom,
    error,
    isConnected,
    onlineMembers,
    fetchJoinedRooms,
    fetchRoomData,
    createRoom,
    joinRoom,
    deleteRoom,
    leaveRoom,
    shareRoom,
    unshareRoom,
    copyShareLink,
    copyRoomId,
    sendMessage,
    openOverview,
    closeOverview,
    initializeSocket,
    disconnectSocket,
    toggleRoomExpansion,
    setShareDialogOpen,
    promoteToAdmin,
    demoteFromAdmin,
    kickMember,
    canManageRoom,
    isOwner,
    canManageMembers,
    getOverviewRoom,
    setUser,
  };
}; 