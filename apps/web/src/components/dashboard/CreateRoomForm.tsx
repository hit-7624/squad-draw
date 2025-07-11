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

const MAX_CREATED_ROOMS = 3;

export const CreateRoomForm = ({ newRoomName, setNewRoomName, onCreateRoom, actionLoading, createdRoomsCount }: CreateRoomFormProps) => {
  const isAtLimit = createdRoomsCount >= MAX_CREATED_ROOMS;
  return (
    <Card className="bg-bg-1 border-border-1">
      <CardHeader>
        <CardTitle className="text-font-1 font-handlee text-xl">Create New Room</CardTitle>
        <CardDescription className="text-font-2 text-base">
          Start a new collaborative drawing session
          <br />
          <span className={`text-sm ${isAtLimit ? 'text-red-400' : 'text-font-3'}`}>
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
              className="bg-bg-2 text-font-1 border-border-1 placeholder:text-font-2 focus:border-custom text-base py-2"
            />
          </div>
          <Button 
            type="submit" 
            disabled={actionLoading === "create" || !newRoomName.trim() || isAtLimit}
            className={`${isAtLimit ? 'bg-gray-500 cursor-not-allowed' : 'bg-custom hover:bg-custom-hover'} text-white disabled:opacity-50 text-base px-4 py-2`}
          >
            {actionLoading === "create" ? "Creating..." : isAtLimit ? "Limit Reached" : "Create"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}; 