import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { RoomCard } from "./RoomCard";
import { Room, User } from "./dashboard.types";

interface RoomsListProps {
  rooms: Room[];
  user: User | null;
  selectedRoomId: string | null;
  expandedRoom: string | null;
  actionLoading: string | null;
  shareDialogOpen: string | null;
  onSelectRoom: (roomId: string) => void;
  onToggleExpansion: (roomId: string) => void;
  onShareRoom: (roomId: string) => void;
  onUnshareRoom: (roomId: string) => void;
  onDeleteRoom: (roomId: string) => void;
  onLeaveRoom: (roomId: string, roomName: string, isOwner: boolean) => void;
  onCopyShareLink: (roomId: string) => void;
  canManageRoom: (room: Room) => boolean;
  isOwner: (room: Room) => boolean;
}

export const RoomsList = ({
  rooms,
  user,
  selectedRoomId,
  expandedRoom,
  actionLoading,
  shareDialogOpen,
  onSelectRoom,
  onToggleExpansion,
  onShareRoom,
  onUnshareRoom,
  onDeleteRoom,
  onLeaveRoom,
  onCopyShareLink,
  canManageRoom,
  isOwner
}: RoomsListProps) => {
  return (
    <Card className="bg-bg-1 border-border-1">
      <CardHeader>
        <CardTitle className="text-font-1 font-handlee text-xl">Your Rooms ({rooms.length})</CardTitle>
        <CardDescription className="text-font-2 text-base">Manage your drawing rooms</CardDescription>
      </CardHeader>
      <CardContent>
        {rooms.length === 0 ? (
          <p className="text-font-2 italic text-center py-8 text-lg">
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
                isSelected={selectedRoomId === room.id}
                actionLoading={actionLoading}
                shareDialogOpen={shareDialogOpen}
                onToggleExpansion={onToggleExpansion}
                onSelectRoom={onSelectRoom}
                onShareRoom={onShareRoom}
                onUnshareRoom={onUnshareRoom}
                onDeleteRoom={onDeleteRoom}
                onLeaveRoom={onLeaveRoom}
                onCopyShareLink={onCopyShareLink}
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