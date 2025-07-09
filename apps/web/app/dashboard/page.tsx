"use client"

import { useEffect, useState } from "react";
import { StatusMessages } from "../../components/dashboard/StatusMessages";
import { UserInfoCard } from "../../components/dashboard/UserInfoCard";
import { CreateRoomForm } from "../../components/dashboard/CreateRoomForm";
import { JoinRoomForm } from "../../components/dashboard/JoinRoomForm";
import { RoomsList, RoomOverview, RoomOverviewEmpty } from "../../components/dashboard";
import { useUser, useRoom, useNotification, useForm } from "../../hooks";

export default function Dashboard() {
    const { user, loading: userLoading, error: userError, fetchUser } = useUser();
    const { 
        joinedRooms, 
        overviewRoomId, 
        messages, 
        members, 
        actionLoading, 
        shareDialogOpen, 
        expandedRoom, 
        error: roomError,
        isConnected,
        onlineMembers,
        fetchJoinedRooms,
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
        disconnectSocket,
        toggleRoomExpansion,
        promoteToAdmin,
        demoteFromAdmin,
        kickMember,
        canManageRoom,
        isOwner,
        canManageMembers,
        getOverviewRoom,
        setUser
    } = useRoom();
    const { error, success, showError, showSuccess } = useNotification();
    const { 
        newRoomName, 
        newMessage, 
        joinRoomId, 
        setNewRoomName, 
        setNewMessage, 
        setJoinRoomId,
        resetNewRoomName,
        resetNewMessage,
        resetJoinRoomId
    } = useForm();
    
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserAndRooms();
        
        return () => {
            disconnectSocket();
        };
    }, []);

    useEffect(() => {
        if (user) {
            setUser(user);
        }
    }, [user, setUser]);

    const fetchUserAndRooms = async () => {
        try {
            await fetchUser();
            await fetchJoinedRooms();
        } catch (err: any) {
            console.error("Error fetching user data:", err);
            showError(userError || roomError || err.response?.data?.message || "Failed to load user data");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRoomName.trim()) return;
        
        try {
            await createRoom(newRoomName);
            resetNewRoomName();
            showSuccess("Room created successfully!");
        } catch (err: any) {
            showError(roomError || "Failed to create room");
        }
    };

    const handleJoinRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!joinRoomId.trim()) return;
        
        try {
            await joinRoom(joinRoomId);
            resetJoinRoomId();
            showSuccess("Joined room successfully!");
        } catch (err: any) {
            showError(roomError || "Failed to join room");
        }
    };

    const handleDeleteRoom = async (roomId: string) => {
        try {
            await deleteRoom(roomId);
            showSuccess("Room deleted successfully!");
        } catch (err: any) {
            showError(roomError || "Failed to delete room");
        }
    };

    const handleLeaveRoom = async (roomId: string, roomName: string, isOwner: boolean) => {
        try {
            await leaveRoom(roomId, roomName, isOwner);
            showSuccess("Left room successfully!");
        } catch (err: any) {
            showError(roomError || "Failed to leave room");
        }
    };

    const handleShareRoom = async (roomId: string) => {
        try {
            await shareRoom(roomId);
            showSuccess("Room shared successfully!");
        } catch (err: any) {
            showError(roomError || "Failed to share room");
        }
    };

    const handleUnshareRoom = async (roomId: string) => {
        try {
            await unshareRoom(roomId);
            showSuccess("Room unshared successfully!");
        } catch (err: any) {
            showError(roomError || "Failed to unshare room");
        }
    };

    const handleCopyShareLink = (roomId: string) => {
        copyShareLink(roomId);
        showSuccess("Share link copied to clipboard!");
    };

    const handleCopyRoomId = (roomId: string) => {
        copyRoomId(roomId);
        showSuccess("Room ID copied to clipboard!");
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        
        try {
            await sendMessage(newMessage);
            resetNewMessage();
        } catch (err: any) {
            showError(roomError || "Failed to send message");
        }
    };

    const handleCloseOverview = () => {
        closeOverview();
    };

    const overviewRoom = getOverviewRoom();

    if (loading || userLoading) {
        return (
            <div className="min-h-screen bg-bg-2 flex items-center justify-center">
                <div className="text-center text-font-1">
                    <h2 className="text-3xl font-handlee mb-4">Loading Dashboard...</h2>
                    <div className="w-8 h-8 border-4 border-custom border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-2 text-font-1">
            <div className="max-w-7xl mx-auto p-6 font-didact-gothic">
                <h1 className="text-5xl font-handlee mb-8 text-center text-font-1">Squad Draw Dashboard</h1>
                
                {/* Status Messages */}
                <StatusMessages error={error} success={success} />
                
                {/* Connection Status */}
                {overviewRoom && (
                    <div className="mb-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            isConnected 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                        }`}>
                            <span className={`w-2 h-2 mr-2 rounded-full ${
                                isConnected ? 'bg-green-400' : 'bg-red-400'
                            }`}></span>
                            {isConnected ? 'Connected to chat' : 'Disconnected from chat'}
                        </span>
                    </div>
                )}
                
                {/* User Info */}
                {user && <UserInfoCard user={user} />}

                {/* Always show two columns - Room Management (Left) and Overview (Right) */}
                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Left Column - Room Management */}
                    <div className="space-y-6">
                        {/* Room Creation */}
                        <CreateRoomForm
                            newRoomName={newRoomName}
                            setNewRoomName={setNewRoomName}
                            onCreateRoom={handleCreateRoom}
                            actionLoading={actionLoading}
                        />

                        {/* Join Room */}
                        <JoinRoomForm
                            joinRoomId={joinRoomId}
                            setJoinRoomId={setJoinRoomId}
                            onJoinRoom={handleJoinRoom}
                            actionLoading={actionLoading}
                        />

                        {/* Joined Rooms */}
                        <RoomsList
                            rooms={joinedRooms}
                            user={user}
                            overviewRoomId={overviewRoomId}
                            expandedRoom={expandedRoom}
                            actionLoading={actionLoading}
                            shareDialogOpen={shareDialogOpen}
                            onlineMembers={onlineMembers}
                            onOpenOverview={openOverview}
                            onToggleExpansion={toggleRoomExpansion}
                            onShareRoom={handleShareRoom}
                            onUnshareRoom={handleUnshareRoom}
                            onDeleteRoom={handleDeleteRoom}
                            onLeaveRoom={handleLeaveRoom}
                            onCopyShareLink={handleCopyShareLink}
                            onCopyRoomId={handleCopyRoomId}
                            canManageRoom={(room) => canManageRoom(room, user)}
                            isOwner={(room) => isOwner(room, user)}
                        />
                    </div>

                    {/* Right Column - Room Overview (Always Present) */}
                    <div className="space-y-6">
                        {overviewRoom ? (
                            <RoomOverview
                                overviewRoom={overviewRoom}
                                messages={messages}
                                members={members}
                                currentUser={user}
                                newMessage={newMessage}
                                setNewMessage={setNewMessage}
                                onSendMessage={handleSendMessage}
                                onCloseOverview={handleCloseOverview}
                                actionLoading={actionLoading}
                                isConnected={isConnected}
                                onlineMembers={onlineMembers}
                                canManageMembers={canManageMembers(overviewRoom, user)}
                                isOwner={isOwner(overviewRoom, user)}
                                onPromoteToAdmin={promoteToAdmin}
                                onDemoteFromAdmin={demoteFromAdmin}
                                onKickMember={kickMember}
                            />
                        ) : (
                            <RoomOverviewEmpty 
                                hasRooms={joinedRooms.length > 0}
                                onCreateRoom={() => {
                                    // Focus on the create room input
                                    const createInput = document.querySelector('input[placeholder="Enter room name"]') as HTMLInputElement;
                                    createInput?.focus();
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}