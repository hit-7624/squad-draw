import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface JoinRoomFormProps {
  joinRoomId: string;
  setJoinRoomId: (id: string) => void;
  onJoinRoom: (e: React.FormEvent) => Promise<void>;
  actionLoading: string | null;
}

export const JoinRoomForm = ({ joinRoomId, setJoinRoomId, onJoinRoom, actionLoading }: JoinRoomFormProps) => {
  return (
    <Card className="bg-bg-1 border-border-1">
      <CardHeader>
        <CardTitle className="text-font-1 font-handlee text-xl">Join Room</CardTitle>
        <CardDescription className="text-font-2 text-base">Enter a room ID to join an existing session</CardDescription>
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
            disabled={actionLoading === "join" || !joinRoomId.trim()}
            className="bg-custom text-white hover:bg-custom-hover disabled:opacity-50 text-base px-4 py-2"
          >
            {actionLoading === "join" ? "Joining..." : "Join"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}; 