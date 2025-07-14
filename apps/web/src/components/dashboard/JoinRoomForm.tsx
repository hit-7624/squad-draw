import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface JoinRoomFormProps {
  joinRoomId: string;
  setJoinRoomId: (id: string) => void;
  onJoinRoom: (e: React.FormEvent) => Promise<void>;
  actionLoading: string | null;
  joinedRoomsCount: number;
}

const MAX_JOINED_ROOMS = 5;

export const JoinRoomForm = ({
  joinRoomId,
  setJoinRoomId,
  onJoinRoom,
  actionLoading,
  joinedRoomsCount,
}: JoinRoomFormProps) => {
  const isAtLimit = joinedRoomsCount >= MAX_JOINED_ROOMS;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Join Room</CardTitle>
        <CardDescription className="font-serif">
          Enter a room ID to join an existing session
          <br />
          <span
            className={`text-sm font-serif ${isAtLimit ? "text-destructive" : "text-muted-foreground"}`}
          >
            {joinedRoomsCount}/{MAX_JOINED_ROOMS} rooms joined
            {isAtLimit && " - Leave a room to join a new one"}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onJoinRoom} className="flex gap-3">
          <div className="flex-1">
            <Input
              type="text"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value)}
              placeholder="Enter room ID"
              disabled={actionLoading === "join"}
            />
          </div>
          <Button
            type="submit"
            disabled={
              actionLoading === "join" || !joinRoomId.trim() || isAtLimit
            }
            variant={isAtLimit ? "secondary" : "default"}
          >
            {actionLoading === "join"
              ? "Joining..."
              : isAtLimit
                ? "Limit Reached"
                : "Join"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
