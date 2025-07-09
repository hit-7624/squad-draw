import { UserLogin, UserSignup } from "@repo/schemas";

export type SignInFormData = UserLogin;
export type SignUpFormData = UserSignup;

export interface AuthLayoutProps {
  children: React.ReactNode;
}

export interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
}

export interface FormFieldProps {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  register: any;
  error?: string;
  helpText?: string;
}

export interface AuthButtonProps {
  isLoading: boolean;
  loadingText: string;
  buttonText: string;
}

export interface StatusMessageProps {
  message: string;
  type: 'success' | 'error';
} 