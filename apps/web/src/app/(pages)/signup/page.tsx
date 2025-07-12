import { LoginForm } from "@/components/login-form"
import Link from "next/link"
import Image from "next/image"
export default function SignUpPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 relative">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center">
          <img src="/logo.svg" alt="Squad Draw" className="w-40 h-auto" />
        </Link>
        <LoginForm mode="signup" />
      </div>
    </div>
  )
}
