import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Room, User } from "./dashboard.types";

interface RoomCardProps {
  room: Room;
  user: User | null;
  isExpanded: boolean;
  isSelected: boolean;
  actionLoading: string | null;
  shareDialogOpen: string | null;
  onToggleExpansion: (roomId: string) => void;
  onSelectRoom: (roomId: string) => void;
  onShareRoom: (roomId: string) => void;
  onUnshareRoom: (roomId: string) => void;
  onDeleteRoom: (roomId: string) => void;
  onLeaveRoom: (roomId: string, roomName: string, isOwner: boolean) => void;
  onCopyShareLink: (roomId: string) => void;
  canManageRoom: (room: Room) => boolean;
  isOwner: (room: Room) => boolean;
}

export const RoomCard = ({
  room,
  user,
  isExpanded,
  isSelected,
  actionLoading,
  shareDialogOpen,
  onToggleExpansion,
  onSelectRoom,
  onShareRoom,
  onUnshareRoom,
  onDeleteRoom,
  onLeaveRoom,
  onCopyShareLink,
  canManageRoom,
  isOwner
}: RoomCardProps) => {
  return (
    <div 
      className={`rounded-lg border transition-all duration-200 cursor-pointer hover:bg-bg-1/50 ${
        isSelected 
          ? 'border-custom bg-custom/10 hover:bg-custom/15' 
          : 'border-border-1 bg-bg-2/50 hover:bg-bg-2/80'
      } ${isExpanded ? 'shadow-lg' : 'hover:shadow-md'}`}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) {
          return;
        }
        onToggleExpansion(room.id);
      }}
    >
      {/* Header - Always Visible */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="text-font-2 transition-colors">
            <svg 
              className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h4 className="text-lg font-semibold text-font-1 truncate">
              {room.name}
            </h4>
            {isOwner(room) && (
              <span className="text-xs px-2 py-1 bg-custom text-white rounded-full">Owner</span>
            )}
            {!isOwner(room) && room.userRole === 'ADMIN' && (
              <span className="text-xs px-2 py-1 bg-green-600 text-white rounded-full">Admin</span>
            )}
            {room.userRole === 'MEMBER' && (
              <span className="text-xs px-2 py-1 bg-font-2 text-bg-2 rounded-full">Member</span>
            )}
          </div>
        </div>
        <Button 
          onClick={(e) => {
            e.stopPropagation();
            window.location.href = `/room/${room.id}`;
          }}
          size="sm"
          className="bg-custom hover:bg-custom-hover text-white text-sm px-3 py-1 transition-colors"
        >
          Visit Room
        </Button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-border-1/50 animate-in slide-in-from-top-2 duration-200">
          <div className="pt-3 space-y-3">
            {/* Room Details */}
            <div className="text-sm text-font-2 space-y-1">
              <p>Created: {new Date(room.createdAt).toLocaleString()}</p>
              <div className="flex items-center gap-2">
                <span>Shared:</span>
                {room.isShared ? (
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-custom flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="ml-1 text-custom text-sm">Yes</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-font-2 flex items-center justify-center">
                      <span className="text-bg-2 text-xs font-bold">✕</span>
                    </div>
                    <span className="ml-1 text-font-2 text-sm">No</span>
                  </div>
                )}
              </div>
              {room.isShared && (
                <p className="font-mono text-xs text-font-3 bg-bg-2 p-2 rounded border border-border-1">
                  ID: {room.id}
                </p>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 justify-between" onClick={(e) => e.stopPropagation()}>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => {
                    onSelectRoom(room.id);
                    setTimeout(() => {
                      if (window.scrollTo) {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      } else {
                        document.documentElement.scrollTop = 0;
                        document.body.scrollTop = 0;
                      }
                    }, 100);
                  }}
                  disabled={isSelected}
                  size="sm"
                  className={`${
                    isSelected 
                      ? 'bg-font-2 text-bg-2' 
                      : 'bg-custom hover:bg-custom-hover text-white'
                  } disabled:opacity-50 text-sm px-3 py-1 transition-colors`}
                >
                  {isSelected ? "Overview Active" : "Overview"}
                </Button>

                {/* Share/Unshare - Admin/Owner only */}
                {canManageRoom(room) && (
                  <Button
                    onClick={() => room.isShared ? onUnshareRoom(room.id) : onShareRoom(room.id)}
                    disabled={actionLoading === `share-${room.id}` || actionLoading === `unshare-${room.id}`}
                    size="sm"
                    className={`${
                      room.isShared 
                        ? 'bg-font-2 hover:bg-font-3 text-bg-2' 
                        : 'bg-custom hover:bg-custom-hover text-white'
                    } disabled:opacity-50 text-sm px-3 py-1 transition-colors`}
                  >
                    {actionLoading === `share-${room.id}` ? "Sharing..." : 
                     actionLoading === `unshare-${room.id}` ? "Unsharing..." :
                     room.isShared ? "Unshare" : "Share"}
                  </Button>
                )}

                {/* Copy Link - Shared rooms only */}
                {room.isShared && (
                  <Button
                    onClick={() => onCopyShareLink(room.id)}
                    size="sm"
                    className="bg-custom hover:bg-custom-hover text-white text-sm px-3 py-1 transition-colors"
                  >
                    Copy Link
                  </Button>
                )}
              </div>

              {/* Right side actions */}
              <div className="flex gap-2">
                {/* Delete - Owner only */}
                {isOwner(room) && (
                  <Button
                    onClick={() => onDeleteRoom(room.id)}
                    disabled={actionLoading === `delete-${room.id}`}
                    size="sm"
                    className="bg-delete hover:bg-delete-hover text-white disabled:opacity-50 text-sm px-3 py-1 transition-colors"
                  >
                    {actionLoading === `delete-${room.id}` ? "Deleting..." : "Delete"}
                  </Button>
                )}

                {/* Leave - Non-owners */}
                {!isOwner(room) && (
                  <Button
                    onClick={() => onLeaveRoom(room.id, room.name, false)}
                    disabled={actionLoading === `leave-${room.id}`}
                    size="sm"
                    className="bg-font-2 hover:bg-font-3 text-bg-2 disabled:opacity-50 text-sm px-3 py-1 transition-colors"
                  >
                    {actionLoading === `leave-${room.id}` ? "Leaving..." : "Leave"}
                  </Button>
                )}

                {/* Leave for owners (transfers ownership) */}
                {isOwner(room) && (
                  <Button
                    onClick={() => onLeaveRoom(room.id, room.name, true)}
                    disabled={actionLoading === `leave-${room.id}`}
                    size="sm"
                    className="bg-font-2 hover:bg-font-3 text-bg-2 disabled:opacity-50 text-sm px-3 py-1 transition-colors"
                  >
                    {actionLoading === `leave-${room.id}` ? "Leaving..." : "Leave & Transfer"}
                  </Button>
                )}
              </div>
            </div>

            {/* Share Dialog */}
            {room.isShared && shareDialogOpen === room.id && (
              <div className="mt-4 p-4 bg-bg-2 border border-border-1 rounded-lg" onClick={(e) => e.stopPropagation()}>
                <h5 className="text-sm font-semibold text-font-1 mb-2">Share this room:</h5>
                <div className="flex gap-2">
                  <Input 
                    type="text" 
                    value={`${window.location.origin}/room/${room.id}`}
                    readOnly
                    className="flex-1 text-xs font-mono bg-dark2 border-border-1 text-font-3"
                  />
                  <Button 
                    onClick={() => onCopyShareLink(room.id)}
                    size="sm"
                    className="bg-custom hover:bg-custom-hover text-white text-sm px-3 py-1 transition-colors"
                  >
                    Copy
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 