import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface CreateRoomFormProps {
  newRoomName: string;
  setNewRoomName: (name: string) => void;
  onCreateRoom: (e: React.FormEvent) => Promise<void>;
  actionLoading: string | null;
}

export const CreateRoomForm = ({ newRoomName, setNewRoomName, onCreateRoom, actionLoading }: CreateRoomFormProps) => {
  return (
    <Card className="bg-bg-1 border-border-1">
      <CardHeader>
        <CardTitle className="text-font-1 font-handlee text-xl">Create New Room</CardTitle>
        <CardDescription className="text-font-2 text-base">Start a new collaborative drawing session</CardDescription>
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
            disabled={actionLoading === "create" || !newRoomName.trim()}
            className="bg-custom text-white hover:bg-custom-hover disabled:opacity-50 text-base px-4 py-2"
          >
            {actionLoading === "create" ? "Creating..." : "Create"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}; 