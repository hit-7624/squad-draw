import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RoomCard } from "./RoomCard";
import { Room, User } from "./dashboard.types";

interface RoomsListProps {
  rooms: Room[];
  user: User | null;
  overviewRoomId: string | null;
  expandedRoom: string | null;
  actionLoading: string | null;
  shareDialogOpen: string | null;
  onlineMembers: string[];
  onOpenOverview: (roomId: string | null) => void;
  onToggleExpansion: (roomId: string) => void;
  onShareRoom: (roomId: string) => void;
  onUnshareRoom: (roomId: string) => void;
  onDeleteRoom: (roomId: string) => void;
  onLeaveRoom: (roomId: string, roomName: string, isOwner: boolean) => void;
  onCopyShareLink: (roomId: string) => void;
  onCopyRoomId: (roomId: string) => void;
  canManageRoom: (room: Room) => boolean;
  isOwner: (room: Room) => boolean;
}

export const RoomsList = ({
  rooms,
  user,
  overviewRoomId,
  expandedRoom,
  actionLoading,
  shareDialogOpen,
  onlineMembers,
  onOpenOverview,
  onToggleExpansion,
  onShareRoom,
  onUnshareRoom,
  onDeleteRoom,
  onLeaveRoom,
  onCopyShareLink,
  onCopyRoomId,
  canManageRoom,
  isOwner
}: RoomsListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Rooms ({rooms.length})</CardTitle>
        <CardDescription className="font-serif">Manage your drawing rooms</CardDescription>
      </CardHeader>
      <CardContent>
        {rooms.length === 0 ? (
          <p className="text-muted-foreground italic text-center py-8 text-lg">
            No rooms yet. Create one or join using a room ID.
          </p>
        ) : (
          <div className="space-y-4">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                user={user}
                isExpanded={expandedRoom === room.id}
                isSelected={overviewRoomId === room.id}
                actionLoading={actionLoading}
                shareDialogOpen={shareDialogOpen}
                onlineMembers={overviewRoomId === room.id ? onlineMembers : []}
                onToggleExpansion={onToggleExpansion}
                onOpenOverview={onOpenOverview}
                onShareRoom={onShareRoom}
                onUnshareRoom={onUnshareRoom}
                onDeleteRoom={onDeleteRoom}
                onLeaveRoom={onLeaveRoom}
                onCopyShareLink={onCopyShareLink}
                onCopyRoomId={onCopyRoomId}
                canManageRoom={canManageRoom}
                isOwner={isOwner}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 