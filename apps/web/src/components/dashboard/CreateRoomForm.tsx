import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CreateRoomFormProps {
  newRoomName: string;
  setNewRoomName: (name: string) => void;
  onCreateRoom: (e: React.FormEvent) => Promise<void>;
  actionLoading: string | null;
  createdRoomsCount: number;
}

const MAX_CREATED_ROOMS = Number(process.env.NEXT_PUBLIC_MAX_CREATED_ROOMS);

export const CreateRoomForm = ({ newRoomName, setNewRoomName, onCreateRoom, actionLoading, createdRoomsCount }: CreateRoomFormProps) => {
  const isAtLimit = createdRoomsCount >= MAX_CREATED_ROOMS;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Room</CardTitle>
        <CardDescription className="font-serif">
          Start a new collaborative drawing session
          <br />
          <span className={`text-sm font-serif ${isAtLimit ? 'text-red-500' : 'text-muted-foreground'}`}>
            {createdRoomsCount}/{MAX_CREATED_ROOMS} rooms created
            {isAtLimit && " - Delete a room to create a new one"}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onCreateRoom} className="flex gap-3">
          <div className="flex-1">
            <Input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Enter room name"
              disabled={actionLoading === "create"}
            />
          </div>
          <Button 
            type="submit" 
            disabled={actionLoading === "create" || !newRoomName.trim() || isAtLimit}
            variant={isAtLimit ? "secondary" : "default"}
          >
            {actionLoading === "create" ? "Creating..." : isAtLimit ? "Limit Reached" : "Create"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}; 