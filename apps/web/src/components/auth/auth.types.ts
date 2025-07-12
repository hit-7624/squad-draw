import { UserLogin, UserSignup } from "@repo/schemas";

export type SignInFormData = UserLogin;
export type SignUpFormData = UserSignup;

export interface AuthLayoutProps {
  children: React.ReactNode;
} 