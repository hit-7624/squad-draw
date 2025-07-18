// apps/web/src/components/dashboard/RoomOverviewEmpty.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RoomOverviewEmptyProps {
  hasRooms: boolean;
  onCreateRoom: () => void;
}

export const RoomOverviewEmpty = ({
  hasRooms,
  onCreateRoom,
}: RoomOverviewEmptyProps) => {
  return (
    <div className="space-y-6">
      {/* Main Empty State Card */}
      <Card className="min-h-[500px] flex items-center justify-center">
        <CardContent className="text-center py-5 px-8 flex items-center justify-center">
          <div className="space-y-8 max-w-2xl">
            {/* Main Message */}
            <div className="space-y-4">
              <h2 className="text-3xl">
                {hasRooms ? "Select a Room to View Details" : "Welcome to Squad Draw!"}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed font-serif">
                {hasRooms
                  ? "Click on any room from your list to see its members and manage room settings."
                  : "Create your first room or join an existing one to start collaborating."}
              </p>
            </div>

            {/* Quick Start Instructions */}
            <div className="space-y-4 text-muted-foreground font-serif">
              <h3 className="text-lg font-normal text-foreground">
                Quick Start:
              </h3>
              <div className="text-sm space-y-2 font-serif">
                {!hasRooms ? (
                  <>
                    <p>1. Create a new room or join with a room ID.</p>
                    <p>2. Select a room to view its details and members.</p>
                    <p>3. Visit a room to access drawing tools and chat.</p>
                  </>
                ) : (
                  <>
                    <p>1. Select a room from "Your Rooms" list.</p>
                    <p>2. View room details and manage members here.</p>
                    <p>3. Click "Visit Room" to start drawing and chatting.</p>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {!hasRooms && (
              <div className="flex justify-center">
                <Button onClick={onCreateRoom} size="lg" variant="default">
                  Create Your First Room
                </Button>
              </div>
            )}

            {/* Features List */}
            <div className="pt-6 border-t border-border/30">
              <h3 className="text-lg mb-6">What you can do:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-muted-foreground font-serif">
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                  <span>Real-time collaborative drawing</span>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                  <span>Real-time chat & user presence</span>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                  <span>Room & member management</span>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                  <span>Secure authentication & roles</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};