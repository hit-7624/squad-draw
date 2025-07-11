import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Room } from "./dashboard.types";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface UserInfoCardProps {
  user: User;
  joinedRooms?: Room[];
}

export const UserInfoCard = ({ user, joinedRooms = [] }: UserInfoCardProps) => {
  const router = useRouter();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <Card className="mb-8 bg-bg-1 border-border-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Profile Picture or Initial */}
            <div className="w-16 h-16 rounded-full bg-custom flex items-center justify-center text-white text-xl font-handlee">
              {user.image ? (
                <img 
                  src={user.image} 
                  alt={user.name} 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            
            {/* User Info */}
            <div>
              <CardTitle className="text-font-1 font-handlee text-2xl">Welcome, {user.name}</CardTitle>
              <CardDescription className="text-font-2 text-base">{user.email}</CardDescription>
              
              {/* Additional Info */}
              <div className="flex items-center gap-4 mt-2 text-sm text-font-2">
                <span>
                  Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleSignOut}
              className="bg-delete text-white hover:bg-delete-hover"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {/* Room Stats */}
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-bg-2 p-4 rounded-lg border border-border-1 text-center">
            <div className="text-2xl font-bold text-custom">{joinedRooms.length}/5</div>
            <div className="text-sm text-font-1">Joined Rooms</div>
            <div className="text-xs text-font-3 mt-1">
              {joinedRooms.length >= 5 ? "Limit reached" : `${5 - joinedRooms.length} remaining`}
            </div>
          </div>
          
          <div className="bg-bg-2 p-4 rounded-lg border border-border-1 text-center">
            <div className="text-2xl font-bold text-custom">
              {joinedRooms.filter(room => room.owner.id === user.id).length}/3
            </div>
            <div className="text-sm text-font-1">Created Rooms</div>
            <div className="text-xs text-font-3 mt-1">
              {joinedRooms.filter(room => room.owner.id === user.id).length >= 3 
                ? "Limit reached" 
                : `${3 - joinedRooms.filter(room => room.owner.id === user.id).length} remaining`}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 