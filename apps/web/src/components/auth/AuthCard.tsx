import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthCardProps } from "./auth.types";
import Link from "next/link";

export const AuthCard = ({ 
  title, 
  description, 
  children, 
  footerText, 
  footerLinkText, 
  footerLinkHref 
}: AuthCardProps) => {
  return (
    <Card className="bg-bg-1 border border-border-1 text-font-1">
      <CardHeader className="space-y-1">
        <CardTitle className="text-3xl text-center font-handlee text-font-1">
          {title}
        </CardTitle>
        <CardDescription className="text-center text-base text-font-2">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {children}
        
        <div className="mt-6 text-center">
          <p className="text-base text-font-2">
            {footerText}{" "}
            <Link href={footerLinkHref} className="font-medium text-custom hover:text-custom-hover underline">
              {footerLinkText}
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}; 