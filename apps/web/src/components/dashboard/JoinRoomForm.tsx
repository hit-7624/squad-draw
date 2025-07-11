import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

export const JoinRoomForm = ({ joinRoomId, setJoinRoomId, onJoinRoom, actionLoading, joinedRoomsCount }: JoinRoomFormProps) => {
  const isAtLimit = joinedRoomsCount >= MAX_JOINED_ROOMS;
  return (
    <Card className="bg-bg-1 border-border-1">
      <CardHeader>
        <CardTitle className="text-font-1 font-handlee text-xl">Join Room</CardTitle>
        <CardDescription className="text-font-2 text-base">
          Enter a room ID to join an existing session
          <br />
          <span className={`text-sm ${isAtLimit ? 'text-red-400' : 'text-font-3'}`}>
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
              className="bg-bg-2 text-font-1 border-border-1 placeholder:text-font-2 focus:border-custom text-base py-2"
            />
          </div>
          <Button 
            type="submit" 
            disabled={actionLoading === "join" || !joinRoomId.trim() || isAtLimit}
            className={`${isAtLimit ? 'bg-gray-500 cursor-not-allowed' : 'bg-custom hover:bg-custom-hover'} text-white disabled:opacity-50 text-base px-4 py-2`}
          >
            {actionLoading === "join" ? "Joining..." : isAtLimit ? "Limit Reached" : "Join"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}; 