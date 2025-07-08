import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { MemberCard } from "./MemberCard";
import { Room, Message, Member, User } from "./dashboard.types";

interface RoomOverviewProps {
  overviewRoom: Room;
  messages: Message[];
  members: Member[];
  currentUser: User | null;
  newMessage: string;
  setNewMessage: (message: string) => void;
  onSendMessage: (e: React.FormEvent) => Promise<void>;
  actionLoading: string | null;
  canManageMembers: boolean;
  isOwner: boolean;
  onPromoteToAdmin: (roomId: string, userId: string) => Promise<void>;
  onDemoteFromAdmin: (roomId: string, userId: string) => Promise<void>;
  onKickMember: (roomId: string, userId: string) => Promise<void>;
}

export const RoomOverview = ({
  overviewRoom,
  messages,
  members,
  currentUser,
  newMessage,
  setNewMessage,
  onSendMessage,
  actionLoading,
  canManageMembers,
  isOwner,
  onPromoteToAdmin,
  onDemoteFromAdmin,
  onKickMember
}: RoomOverviewProps) => {
  return (
    <div className="space-y-6">
      {/* Room Header */}
      <Card className="bg-bg-1 border-border-1 cursor-pointer hover:bg-bg-1/80 transition-colors" >
        <CardHeader>
          <CardTitle className="text-font-1 font-handlee text-xl">Room: {overviewRoom.name}</CardTitle>
          <CardDescription className="text-font-2 text-base">
            Room Overview • Created: {new Date(overviewRoom.createdAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Messages Section */}
      <Card className="bg-bg-1 border-border-1">
        <CardHeader>
          <CardTitle className="text-font-1 font-handlee text-lg">Messages ({messages.length})</CardTitle>
          <CardDescription className="text-font-2 text-base">Recent room activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Messages List */}
            <div className="max-h-64 overflow-y-auto space-y-3 bg-bg-2 p-4 rounded-lg border border-border-1">
              {messages.length === 0 ? (
                <p className="text-font-2 text-center py-4 text-sm">No messages yet. Be the first to send one!</p>
              ) : (
                messages.slice(-10).map((message) => (
                  <div key={message.id} className="border-b border-border-1/30 pb-2 last:border-b-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-font-1 font-medium text-sm">{message.user.name}</span>
                      <span className="text-font-3 text-xs">{new Date(message.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-font-2 text-sm">{message.message}</p>
                  </div>
                ))
              )}
            </div>

            {/* Send Message Form */}
            <form onSubmit={onSendMessage} className="flex gap-3">
              <div className="flex-1">
                <Input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  disabled={actionLoading === "sendMessage"}
                  className="bg-bg-2 text-font-1 border-border-1 placeholder:text-font-2 focus:border-custom text-base py-2"
                />
              </div>
              <Button 
                type="submit" 
                disabled={actionLoading === "sendMessage" || !newMessage.trim()}
                className="bg-custom text-white hover:bg-custom-hover disabled:opacity-50 text-base px-4 py-2"
              >
                {actionLoading === "sendMessage" ? "Sending..." : "Send"}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Members Section */}
      <Card className="bg-bg-1 border-border-1">
        <CardHeader>
          <CardTitle className="text-font-1 font-handlee text-lg">Members ({members.length})</CardTitle>
          <CardDescription className="text-font-2 text-base">Room participants</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {members.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                currentUser={currentUser}
                room={overviewRoom}
                actionLoading={actionLoading}
                canManageMembers={canManageMembers}
                isOwner={isOwner}
                onPromoteToAdmin={onPromoteToAdmin}
                onDemoteFromAdmin={onDemoteFromAdmin}
                onKickMember={onKickMember}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 