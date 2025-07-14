"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useNotification } from "@/hooks/useNotification";
import Link from "next/link";
import { PasswordSchema, resetPasswordSchema } from "@/schemas/index";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { showError, showSuccess } = useNotification();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tokenFromUrl = params.get("token");
      const errorFromUrl = params.get("error");

      if (errorFromUrl === "invalid_token") {
        setError(
          "This reset link is invalid or has expired. Please request a new one.",
        );
      } else if (tokenFromUrl) {
        setToken(tokenFromUrl);
      } else {
        setError(
          "No reset token found. Please request a new password reset link.",
        );
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      showError(
        "No reset token found. Please request a new password reset link.",
      );
      return;
    }

    // Zod validation
    const result = resetPasswordSchema.safeParse({
      newPassword: password,
      confirmPassword,
    });

    if (!result.success) {
      showError(result.error.errors[0]?.message || "Invalid input");
      return;
    }

    setIsLoading(true);

    const { data, error } = await resetPassword({
      newPassword: password,
      token,
    });

    if (error) {
      console.error("Password reset error:", error);
      if (error.message && error.message.includes("token")) {
        showError(
          "This reset link is invalid or has expired. Please request a new one.",
        );
      } else {
        showError(error.message || "Failed to reset password");
      }
      setIsLoading(false);
    } else {
      console.log("Password reset successful:", data);
      showSuccess(
        "Password reset successful! You can now sign in with your new password.",
      );
      // Redirect to sign in page after a short delay
      setTimeout(() => {
        router.push("/signin");
      }, 2000);
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="container relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-1 lg:px-0 flex">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <Card className="relative">
            <ThemeToggle className="absolute top-4 right-4 z-10" />
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                <svg
                  className="h-8 w-8 text-red-600 dark:text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <CardTitle className="text-xl">Reset Link Invalid</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <Button className="w-full" asChild>
                  <Link href="/forgot-password">Request new reset link</Link>
                </Button>
                <Button variant="ghost" className="w-full" asChild>
                  <Link href="/signin">Back to sign in</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-1 lg:px-0 flex">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <Card className="relative">
          <ThemeToggle className="absolute top-4 right-4 z-10" />
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Reset your password</CardTitle>
            <CardDescription>Enter your new password below.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={8}
                  />
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 8 characters long.
                  </p>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={8}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !token}
                >
                  {isLoading ? "Resetting..." : "Reset password"}
                </Button>
              </div>
            </form>
            <div className="mt-6 text-center">
              <Link
                href="/signin"
                className="text-sm underline underline-offset-4 hover:text-primary"
              >
                Back to sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
