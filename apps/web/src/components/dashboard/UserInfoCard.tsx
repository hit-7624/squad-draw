import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Profile Picture or Initial */}
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl">
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
              <CardTitle>Welcome, {user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>

              {/* Additional Info */}
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span>
                  Member since{" "}
                  {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button onClick={handleSignOut} variant="destructive">
              Sign Out
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Room Stats */}
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-muted p-4 rounded-lg border text-center">
            <div className="text-2xl font-bold text-primary">
              {joinedRooms.length}/5
            </div>
            <div className="text-sm">Joined Rooms</div>
            <div className="text-xs text-muted-foreground mt-1">
              {joinedRooms.length >= 5
                ? "Limit reached"
                : `${5 - joinedRooms.length} remaining`}
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg border text-center">
            <div className="text-2xl font-bold text-primary">
              {joinedRooms.filter((room) => room.owner.id === user.id).length}/3
            </div>
            <div className="text-sm">Created Rooms</div>
            <div className="text-xs text-muted-foreground mt-1">
              {joinedRooms.filter((room) => room.owner.id === user.id).length >=
              3
                ? "Limit reached"
                : `${3 - joinedRooms.filter((room) => room.owner.id === user.id).length} remaining`}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
