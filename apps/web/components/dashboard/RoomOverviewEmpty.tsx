import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

interface RoomOverviewEmptyProps {
  hasRooms: boolean;
  onCreateRoom: () => void;
}

export const RoomOverviewEmpty = ({ hasRooms, onCreateRoom }: RoomOverviewEmptyProps) => {
  return (
    <div className="space-y-6">
      {/* Main Empty State Card */}
      <Card className="bg-bg-1 border-border-1 min-h-[500px] flex items-center justify-center">
        <CardContent className="text-center py-5 px-8 flex items-center justify-center">
          <div className="space-y-8 max-w-2xl">
            {/* Main Message */}
            <div className="space-y-4">
              <h2 className="text-3xl font-handlee text-font-1">
                {hasRooms ? "Select a Room to Chat" : "Welcome to Squad Draw!"}
              </h2>
              <p className="text-lg text-font-2 font-didact-gothic leading-relaxed">
                {hasRooms 
                  ? "Click on any room from the list to automatically open the chat and start messaging with your team members in real-time."
                  : "Create your first room or join an existing one to start collaborating and chatting with your team."
                }
              </p>
            </div>

            {/* Quick Start Instructions */}
            <div className="space-y-4 text-font-2">
              <h3 className="text-lg font-handlee text-font-1">Quick Start:</h3>
              <div className="text-sm space-y-2">
                {!hasRooms ? (
                  <>
                    <p>1. Create a new room or join with a room ID</p>
                    <p>2. Click on the room card to open chat automatically</p>
                    <p>3. Start messaging and visit room for drawing tools</p>
                  </>
                ) : (
                  <>
                    <p>1. Click on any room card to open chat</p>
                    <p>2. Chat opens automatically with room details</p>
                    <p>3. Start messaging or visit room for drawing</p>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {!hasRooms && (
              <div className="flex justify-center">
                <Button 
                  onClick={onCreateRoom}
                  className="bg-custom text-white hover:bg-custom-hover font-didact-gothic text-lg px-8 py-3 h-auto"
                >
                  Create Your First Room
                </Button>
              </div>
            )}

            {/* Features List */}
            <div className="pt-6 border-t border-border-1/30">
              <h3 className="text-lg font-handlee text-font-1 mb-6">
                What you can do:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-font-2">
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-2 h-2 bg-custom rounded-full flex-shrink-0"></div>
                  <span>Real-time messaging</span>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-2 h-2 bg-custom rounded-full flex-shrink-0"></div>
                  <span>Collaborative drawing</span>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-2 h-2 bg-custom rounded-full flex-shrink-0"></div>
                  <span>Team management</span>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-2 h-2 bg-custom rounded-full flex-shrink-0"></div>
                  <span>Room sharing</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 