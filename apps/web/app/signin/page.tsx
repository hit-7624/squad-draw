"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { UserLoginSchema } from "@repo/schemas"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { 
  AuthLayout, 
  AuthCard, 
  FormField, 
  AuthButton, 
  StatusMessage, 
  SignInFormData 
} from "../../components/auth"

const API_URL = process.env.NEXT_PUBLIC_API_SERVER_URL || "http://localhost:3001";

export default function SignInPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string>("")
  const [generalError, setGeneralError] = useState<string>("")

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SignInFormData>({
    resolver: zodResolver(UserLoginSchema)
  })

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const message = urlParams.get('message')
    if (message) {
      setSuccessMessage(message)
    }
  }, [])

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true)
    setGeneralError("")

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push("/dashboard")
      } else {
        const responseData = await response.json()
        setGeneralError(responseData.message || "Login failed")
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
        title="Sign In"
        description="Enter your email and password to access your account"
        footerText="Don't have an account?"
        footerLinkText="Sign up"
        footerLinkHref="/signup"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            placeholder="Enter your password"
            register={register("password")}
            error={errors.password?.message}
          />

          {successMessage && (
            <StatusMessage message={successMessage} type="success" />
          )}

          {generalError && (
            <StatusMessage message={generalError} type="error" />
          )}

          <AuthButton
            isLoading={isLoading}
            loadingText="Signing in..."
            buttonText="Sign In"
          />
        </form>
      </AuthCard>
    </AuthLayout>
  )
} 