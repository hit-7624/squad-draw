"use client"
import { useEffect, useState } from "react";

import { UserInfoCard } from "@/components/dashboard/UserInfoCard";
import { CreateRoomForm } from "@/components/dashboard/CreateRoomForm";
import { JoinRoomForm } from "@/components/dashboard/JoinRoomForm";
import { RoomsList, RoomOverview, RoomOverviewEmpty } from "@/components/dashboard";
import { useRoom, useNotification, useForm } from "@/hooks";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Dashboard() {
    const { data: session, isPending: sessionLoading } = authClient.useSession();
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
    const router = useRouter();

    // Create user object from session
    const user = session?.user ? {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        emailVerified: session.user.emailVerified,
        image: session.user.image || undefined,
        createdAt: session.user.createdAt?.toISOString(),
        updatedAt: session.user.updatedAt?.toISOString()
    } : null;

    useEffect(() => {
        if (!sessionLoading) {
            fetchUserAndRooms();
        }
        
        return () => {
            disconnectSocket();
        };
    }, [sessionLoading]);

    useEffect(() => {
        if (session?.user) {
            const sessionUser = {
                id: session.user.id,
                name: session.user.name,
                email: session.user.email,
                emailVerified: session.user.emailVerified,
                image: session.user.image || undefined,
                createdAt: session.user.createdAt?.toISOString(),
                updatedAt: session.user.updatedAt?.toISOString()
            };
            setUser(sessionUser);
        }
    }, [session, setUser]);

    const fetchUserAndRooms = async () => {
        try {
            setLoading(true);
            if (session?.user) {
                const sessionUser = {
                    id: session.user.id,
                    name: session.user.name,
                    email: session.user.email,
                    emailVerified: session.user.emailVerified,
                    image: session.user.image || undefined,
                    createdAt: session.user.createdAt?.toISOString(),
                    updatedAt: session.user.updatedAt?.toISOString()
                };
                setUser(sessionUser);
            }
            await fetchJoinedRooms();
        } catch (err: any) {
            console.error("Error fetching room data:", err);
            showError(roomError || err.message || "Failed to load data");
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

    // Calculate room counts for limits
    const createdRoomsCount = user ? joinedRooms.filter(room => room.owner.id === user.id).length : 0;
    const joinedRoomsCount = joinedRooms.length;

    // Debug logging
    console.log("Session:", session);
    console.log("User:", user);
    console.log("Loading:", loading, "Session Loading:", sessionLoading);

    if (loading || sessionLoading) {
        return (
            <div className="min-h-screen bg-bg-2 flex items-center justify-center">
                <div className="text-center text-font-1">
                    <h2 className="text-3xl font-handlee mb-4">Loading Dashboard...</h2>
                    <div className="w-8 h-8 border-4 border-custom border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-bg-2 flex items-center justify-center">
                <div className="text-center text-font-1">
                    <h2 className="text-3xl font-handlee mb-4">Please sign in to access the dashboard</h2>
                    <button 
                        onClick={() => router.push('/signin')}
                        className="bg-custom hover:bg-custom-hover text-white px-6 py-2 rounded-md"
                    >
                        Sign In
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-2 text-font-1">
            <div className="max-w-7xl mx-auto p-6 font-didact-gothic">
                <h1 className="text-5xl font-handlee mb-8 text-center text-font-1">Squad Draw Dashboard</h1>
                

                
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
                
                {/* User Info - Always show if user exists */}
                {user && <UserInfoCard user={user} joinedRooms={joinedRooms} />}
                
                {/* Debug info - Remove this after testing */}
                {!user && session && (
                    <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 rounded">
                        <p className="text-yellow-800">Debug: Session exists but user is null</p>
                        <pre className="text-xs">{JSON.stringify(session.user, null, 2)}</pre>
                    </div>
                )}

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
                            createdRoomsCount={createdRoomsCount}
                        />

                        {/* Join Room */}
                        <JoinRoomForm
                            joinRoomId={joinRoomId}
                            setJoinRoomId={setJoinRoomId}
                            onJoinRoom={handleJoinRoom}
                            actionLoading={actionLoading}
                            joinedRoomsCount={joinedRoomsCount}
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