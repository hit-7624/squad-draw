// apps/web/src/app/(pages)/dashboard/page.tsx
"use client";
import { useEffect, useState } from "react";
import { UserInfoCard } from "@/components/dashboard/UserInfoCard";
import { CreateRoomForm } from "@/components/dashboard/CreateRoomForm";
import { JoinRoomForm } from "@/components/dashboard/JoinRoomForm";
import {
  RoomsList,
  RoomOverview,
  RoomOverviewEmpty,
} from "@/components/dashboard";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useDashboardStore } from "@/store/dashboard.store";
import { useNotificationStore } from "@/store/notification.store";
import { useFormStore } from "@/store/form.store";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Dashboard() {
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const {
    joinedRooms,
    overviewRoomId,
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
    openOverview,
    closeOverview,
    toggleRoomExpansion,
    canManageRoom,
    isOwner,
    canManageMembers,
    promoteToAdmin,
    demoteFromAdmin,
    kickMember,
    getOverviewRoom,
  } = useDashboardStore();
  const { showError, showSuccess } = useNotificationStore();
  const {
    newRoomName,
    joinRoomId,
    setNewRoomName,
    setJoinRoomId,
    resetNewRoomName,
    resetJoinRoomId,
  } = useFormStore();

  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!sessionLoading) {
      fetchUserAndRooms();
    }
  }, [sessionLoading]);

  const fetchUserAndRooms = async () => {
    try {
      setLoading(true);
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

  const handleLeaveRoom = async (
    roomId: string,
    roomName: string,
    isOwner: boolean,
  ) => {
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

  const handlePromoteToAdmin = async (roomId: string, userId: string) => {
    try {
      await promoteToAdmin(roomId, userId);
      showSuccess("Member promoted to admin successfully!");
    } catch (err: any) {
      showError(roomError || "Failed to promote member");
    }
  };

  const handleDemoteFromAdmin = async (roomId: string, userId: string) => {
    try {
      await demoteFromAdmin(roomId, userId);
      showSuccess("Member demoted to member successfully!");
    } catch (err: any) {
      showError(roomError || "Failed to demote member");
    }
  };

  const handleKickMember = async (roomId: string, userId: string) => {
    try {
      await kickMember(roomId, userId);
      showSuccess("Member kicked successfully!");
    } catch (err: any) {
      showError(roomError || "Failed to kick member");
    }
  };

  const handleCloseOverview = () => {
    closeOverview();
  };

  const overviewRoom = getOverviewRoom();

  const createdRoomsCount = session?.user
    ? joinedRooms.filter((room) => room.owner.id === session.user.id).length
    : 0;
  const joinedRoomsCount = joinedRooms.length;

  if (loading || sessionLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-foreground">
          <h2 className="text-3xl font-sans mb-4">Loading Dashboard...</h2>
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-foreground">
          <h2 className="text-3xl font-sans mb-4">
            Please sign in to access the dashboard
          </h2>
          <button
            onClick={() => router.push("/signin")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-md"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-8">
          <img src="/logo.svg" alt="Squad Draw" className="w-48 sm:w-60 h-auto" />
          <h1 className="text-4xl sm:text-5xl font-sans text-foreground text-center">Dashboard</h1>
        </div>

        {session?.user && (
          <UserInfoCard user={session.user} joinedRooms={joinedRooms} />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <CreateRoomForm
            newRoomName={newRoomName}
            setNewRoomName={setNewRoomName}
            onCreateRoom={handleCreateRoom}
            actionLoading={actionLoading}
            createdRoomsCount={createdRoomsCount}
          />
          <JoinRoomForm
            joinRoomId={joinRoomId}
            setJoinRoomId={setJoinRoomId}
            onJoinRoom={handleJoinRoom}
            actionLoading={actionLoading}
            joinedRoomsCount={joinedRoomsCount}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <RoomsList
              rooms={joinedRooms}
              user={session?.user}
              overviewRoomId={overviewRoomId}
              expandedRoom={expandedRoom}
              actionLoading={actionLoading}
              shareDialogOpen={shareDialogOpen}
              onlineMembers={[]}
              onJoinRoomInSocket={(roomId) => openOverview(roomId)}
              onToggleExpansion={toggleRoomExpansion}
              onShareRoom={handleShareRoom}
              onUnshareRoom={handleUnshareRoom}
              onDeleteRoom={handleDeleteRoom}
              onLeaveRoom={handleLeaveRoom}
              onCopyShareLink={handleCopyShareLink}
              onCopyRoomId={handleCopyRoomId}
              canManageRoom={(room) => canManageRoom(room, session?.user)}
              isOwner={(room) => isOwner(room, session?.user)}
            />
          </div>

          <div className="space-y-6">
            {overviewRoom ? (
              <RoomOverview
                overviewRoom={overviewRoom}
                members={members}
                currentUser={session?.user}
                onCloseOverview={handleCloseOverview}
                actionLoading={actionLoading}
                canManageMembers={canManageMembers(overviewRoom, session?.user)}
                onPromoteToAdmin={handlePromoteToAdmin}
                onDemoteFromAdmin={handleDemoteFromAdmin}
                onKickMember={handleKickMember}
              />
            ) : (
              <RoomOverviewEmpty
                hasRooms={joinedRooms.length > 0}
                onCreateRoom={() => {
                  const createInput = document.querySelector(
                    'input[placeholder="Enter room name"]',
                  ) as HTMLInputElement;
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