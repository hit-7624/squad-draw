import { Card, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { User } from "./dashboard.types";

interface UserInfoCardProps {
  user: User;
}

export const UserInfoCard = ({ user }: UserInfoCardProps) => {
  return (
    <Card className="mb-8 bg-bg-1 border-border-1">
      <CardHeader>
        <CardTitle className="text-font-1 font-handlee text-2xl">Welcome, {user.name}</CardTitle>
        <CardDescription className="text-font-2 text-base">Email: {user.email}</CardDescription>
      </CardHeader>
    </Card>
  );
}; 