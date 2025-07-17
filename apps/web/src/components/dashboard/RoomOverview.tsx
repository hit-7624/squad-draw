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
}

export const RoomOverview = ({
  overviewRoom,
  members,
  currentUser,
  onCloseOverview,
  actionLoading,
  isConnected,
  onlineMembers,
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
              
                
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/join/room/${overviewRoom.id}`);
                }}
                size="sm"
                variant="outline"
              >
                Copy Link
              </Button>
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
              const isCurrentUser = currentUser?.id === member.id;
              const isMemberOwner = member.id === overviewRoom.owner.id;
              const isAdmin = member.role === "ADMIN";
              const isMember = member.role === "MEMBER";

              return (
                <div key={member.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                          <p className="font-medium text-sm">{member.name}</p>
                        </div>

                        <div className="flex gap-1.5">
                          {isCurrentUser && (
                            <span className="text-xs px-2 py-0.5 bg-primary text-primary-foreground rounded-full font-medium">
                              You
                            </span>
                          )}
                          {isMemberOwner && (
                            <span className="text-xs px-2 py-0.5 bg-primary text-primary-foreground rounded-full font-medium">
                              Owner
                            </span>
                          )}
                          {isAdmin && !isMemberOwner && (
                            <span className="text-xs px-2 py-0.5 bg-primary/70 text-primary-foreground rounded-full font-medium">
                              Admin
                            </span>
                          )}
                          {isMember && (
                            <span className="text-xs px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full font-medium">
                              Member
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-muted-foreground text-xs">{member.email}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
