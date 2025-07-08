"use client"

import { useEffect, useState } from "react";
import { StatusMessages } from "../../components/dashboard/StatusMessages";
import { UserInfoCard } from "../../components/dashboard/UserInfoCard";
import { CreateRoomForm } from "../../components/dashboard/CreateRoomForm";
import { JoinRoomForm } from "../../components/dashboard/JoinRoomForm";
import { RoomsList } from "../../components/dashboard/RoomsList";
import { RoomOverview } from "../../components/dashboard/RoomOverview";
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
        toggleRoomExpansion,
        promoteToAdmin,
        demoteFromAdmin,
        kickMember,
        canManageRoom,
        isOwner,
        canManageMembers,
        getOverviewRoom
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
    }, []);

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
            showSuccess("Message sent!");
        } catch (err: any) {
            showError(roomError || "Failed to send message");
        }
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
                
                {/* User Info */}
                {user && <UserInfoCard user={user} />}

                <div className={`grid gap-8 ${overviewRoom ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}`}>
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

                    {/* Right Column - Room Overview */}
                    {overviewRoom && (
                        <RoomOverview
                            overviewRoom={overviewRoom}
                            messages={messages}
                            members={members}
                            currentUser={user}
                            newMessage={newMessage}
                            setNewMessage={setNewMessage}
                            onSendMessage={handleSendMessage}
                            actionLoading={actionLoading}
                            canManageMembers={canManageMembers(overviewRoom, user)}
                            isOwner={isOwner(overviewRoom, user)}
                            onPromoteToAdmin={promoteToAdmin}
                            onDemoteFromAdmin={demoteFromAdmin}
                            onKickMember={kickMember}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}