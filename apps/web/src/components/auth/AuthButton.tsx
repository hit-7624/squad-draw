import { Button } from "@/components/ui/button";
import { AuthButtonProps } from "./auth.types";

export const AuthButton = ({ isLoading, loadingText, buttonText }: AuthButtonProps) => {
  return (
    <Button 
      type="submit" 
      className="w-full font-bold bg-custom hover:bg-custom-hover text-white text-base py-2" 
      disabled={isLoading}
    >
      {isLoading ? loadingText : buttonText}
    </Button>
  );
}; 