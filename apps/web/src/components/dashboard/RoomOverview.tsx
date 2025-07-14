import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MemberCard } from "./MemberCard";
import { Room, Message, Member, User } from "./dashboard.types";
import { useEffect, useRef } from "react";

interface RoomOverviewProps {
  overviewRoom: Room;
  messages: Message[];
  members: Member[];
  currentUser: User | null;
  newMessage: string;
  setNewMessage: (message: string) => void;
  onSendMessage: (e: React.FormEvent) => Promise<void>;
  onCloseOverview: () => void;
  actionLoading: string | null;
  isConnected: boolean;
  onlineMembers: string[];
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
  onCloseOverview,
  actionLoading,
  isConnected,
  onlineMembers,
  canManageMembers,
  isOwner,
  onPromoteToAdmin,
  onDemoteFromAdmin,
  onKickMember,
}: RoomOverviewProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [messages]);
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
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  isConnected
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                <span
                  className={`w-2 h-2 mr-1 rounded-full ${
                    isConnected ? "bg-green-400" : "bg-red-400"
                  }`}
                ></span>
                {isConnected ? "Live" : "Offline"}
              </span>
              <Button onClick={onCloseOverview} size="sm" variant="secondary">
                Close
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Messages Section */}
      <Card>
        <CardHeader>
          <CardTitle>Messages ({messages.length})</CardTitle>
          <CardDescription>Recent room activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Messages List */}
            <div className="max-h-64 overflow-y-auto space-y-3 bg-muted p-4 rounded-lg border">
              {messages.length === 0 ? (
                <p className="text-muted-foreground text-center py-4 text-sm">
                  No messages yet. Be the first to send one!
                </p>
              ) : (
                <>
                  {messages.slice(-10).map((message) => (
                    <div
                      key={message.id}
                      className="border-b border-border/30 pb-2 last:border-b-0"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">
                          {message.user.name}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm">{message.message}</p>
                    </div>
                  ))}
                  {/* Invisible element for auto-scroll */}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Send Message Form */}
            <form onSubmit={onSendMessage} className="space-y-2">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={
                      isConnected
                        ? "Type your message..."
                        : "Connecting to chat..."
                    }
                    disabled={!isConnected || actionLoading === "sendMessage"}
                    maxLength={1000}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={
                    !isConnected ||
                    actionLoading === "sendMessage" ||
                    !newMessage.trim() ||
                    newMessage.length > 1000
                  }
                  variant="default"
                >
                  {!isConnected
                    ? "Offline"
                    : actionLoading === "sendMessage"
                      ? "Sending..."
                      : "Send"}
                </Button>
              </div>
              {/* Character counter */}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {newMessage.length > 950 && (
                    <span
                      className={`${newMessage.length > 1000 ? "text-destructive" : "text-yellow-500"}`}
                    >
                      {newMessage.length}/1000 characters
                    </span>
                  )}
                </span>
                <span>
                  {!isConnected && "Connecting..."}
                  {isConnected && !newMessage.trim() && "Type a message"}
                  {isConnected &&
                    newMessage.trim() &&
                    newMessage.length <= 1000 &&
                    "Press Enter to send"}
                  {newMessage.length > 1000 && "Message too long"}
                </span>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Members Section */}
      <Card>
        <CardHeader>
          <CardTitle>
            Members ({members.length})
            {onlineMembers.length > 0 && (
              <span className="text-green-600 text-sm font-normal ml-2">
                • {onlineMembers.length} online
              </span>
            )}
          </CardTitle>
          <CardDescription>Room participants</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* Sort members to show online users first */}
            {(() => {
              const sortedMembers = [...members].sort((a, b) => {
                const aOnline = onlineMembers.includes(a.id);
                const bOnline = onlineMembers.includes(b.id);
                if (aOnline && !bOnline) return -1;
                if (!aOnline && bOnline) return 1;
                return a.name.localeCompare(b.name);
              });

              const onlineCount = sortedMembers.filter((m) =>
                onlineMembers.includes(m.id),
              ).length;
              const offlineCount = sortedMembers.length - onlineCount;

              return sortedMembers.map((member, index) => {
                const isOnline = onlineMembers.includes(member.id);
                const showSeparator = index === onlineCount && offlineCount > 0;

                return (
                  <div key={member.id}>
                    {showSeparator && (
                      <div className="flex items-center gap-2 py-2">
                        <div className="flex-1 h-px bg-border"></div>
                        <span className="text-xs text-muted-foreground px-2">
                          Offline ({offlineCount})
                        </span>
                        <div className="flex-1 h-px bg-border"></div>
                      </div>
                    )}
                    <MemberCard
                      member={member}
                      currentUser={currentUser}
                      room={overviewRoom}
                      actionLoading={actionLoading}
                      isOnline={isOnline}
                      canManageMembers={canManageMembers}
                      isOwner={isOwner}
                      onPromoteToAdmin={onPromoteToAdmin}
                      onDemoteFromAdmin={onDemoteFromAdmin}
                      onKickMember={onKickMember}
                    />
                  </div>
                );
              });
            })()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
