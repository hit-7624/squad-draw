import { AuthLayoutProps } from "./auth.types";

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen w-full bg-bg-2 relative text-font-1">
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 font-didact-gothic">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}; 