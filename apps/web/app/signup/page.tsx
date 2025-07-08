"use client"

import React, { useState } from "react"
import { UserSignupSchema } from "@repo/schemas"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { 
  AuthLayout, 
  AuthCard, 
  FormField, 
  AuthButton, 
  StatusMessage, 
  SignUpFormData 
} from "../../components/auth"
import { useRouter } from "next/navigation"

const API_URL = process.env.NEXT_PUBLIC_API_SERVER_URL || "http://localhost:3001";

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [generalError, setGeneralError] = useState<string>("")
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SignUpFormData>({
    resolver: zodResolver(UserSignupSchema)
  })

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true)
    setGeneralError("")

    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: data.name.trim(),
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword
        }),
      })

      if (response.ok) {
        router.push("/signin?message=Account created successfully. Please sign in.")
      } else {
        const responseData = await response.json()
        setGeneralError(responseData.message || "Registration failed")
      }
    } catch (error) {
      setGeneralError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Create Account"
        description="Enter your information to create a new account"
        footerText="Already have an account?"
        footerLinkText="Sign in"
        footerLinkHref="/signin"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            id="name"
            label="Full Name"
            type="text"
            placeholder="Enter your full name"
            register={register("name")}
            error={errors.name?.message}
          />

          <FormField
            id="email"
            label="Email"
            type="email"
            placeholder="Enter your email"
            register={register("email")}
            error={errors.email?.message}
          />
          
          <FormField
            id="password"
            label="Password"
            type="password"
            placeholder="Create a password"
            register={register("password")}
            error={errors.password?.message}
            helpText="Must be 8+ characters with uppercase, lowercase, and number"
          />

          <FormField
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            register={register("confirmPassword")}
            error={errors.confirmPassword?.message}
          />

          {generalError && (
            <StatusMessage message={generalError} type="error" />
          )}

          <AuthButton
            isLoading={isLoading}
            loadingText="Creating Account..."
            buttonText="Create Account"
          />
        </form>
      </AuthCard>
    </AuthLayout>
  )
} 