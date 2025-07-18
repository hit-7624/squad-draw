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
        <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl flex-shrink-0">
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

            <div>
              <CardTitle>Welcome, {user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>

              <div className="flex items-center justify-center sm:justify-start gap-4 mt-2 text-sm text-muted-foreground">
                <span>
                  Member since{" "}
                  {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleSignOut} variant="destructive">
              Sign Out
            </Button>
          </div>
        </div>
      </CardHeader>

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