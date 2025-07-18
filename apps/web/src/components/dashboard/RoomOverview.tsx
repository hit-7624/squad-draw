// apps/web/src/components/dashboard/RoomOverview.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MemberCard } from "./MemberCard";
import { Room, Member, User } from "./dashboard.types";

interface RoomOverviewProps {
  overviewRoom: Room;
  members: Member[];
  currentUser: User | null;
  onCloseOverview: () => void;
  actionLoading: string | null;
  isConnected?: boolean;
  onlineMembers?: string[];
  canManageMembers: boolean;
  onPromoteToAdmin: (roomId: string, userId: string) => Promise<void>;
  onDemoteFromAdmin: (roomId: string, userId: string) => Promise<void>;
  onKickMember: (roomId: string, userId: string) => Promise<void>;
}

export const RoomOverview = ({
  overviewRoom,
  members,
  currentUser,
  onCloseOverview,
  actionLoading,
  isConnected,
  onlineMembers,
  canManageMembers,
  onPromoteToAdmin,
  onDemoteFromAdmin,
  onKickMember,
}: RoomOverviewProps) => {
  return (
    <div className="space-y-6">
      {/* Room Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Room: {overviewRoom.name}</CardTitle>
              <CardDescription>
                Room Overview • Created:{" "}
                {new Date(overviewRoom.createdAt).toLocaleDateString()}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {overviewRoom.isShared && (
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/join/room/${overviewRoom.id}`);
                  }}
                  size="sm"
                  variant="outline"
                >
                  Copy Link
                </Button>
              )}
              <Button onClick={onCloseOverview} size="sm" variant="secondary">
                Close
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Members Section */}
      <Card>
        <CardHeader>
          <CardTitle>
            Members ({members.length})
            {onlineMembers && onlineMembers.length > 0 && (
              <span className="text-green-600 text-sm font-normal ml-2">
                • {onlineMembers.length} online
              </span>
            )}
          </CardTitle>
          <CardDescription>Room participants</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {members.map((member) => {
              const isOnline = onlineMembers ? onlineMembers.includes(member.id) : false;

              return (
                <MemberCard
                  key={member.id}
                  member={member}
                  currentUser={currentUser}
                  room={overviewRoom}
                  actionLoading={actionLoading}
                  isOnline={isOnline}
                  canManageMembers={canManageMembers}
                  isOwner={overviewRoom.owner.id === currentUser?.id} // Pass isOwner prop
                  onPromoteToAdmin={onPromoteToAdmin}
                  onDemoteFromAdmin={onDemoteFromAdmin}
                  onKickMember={onKickMember}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};