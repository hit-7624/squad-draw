"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Button } from "../../components/ui/button"
import { UserSignupSchema, type UserSignup } from "@repo/schemas"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

const API_URL = process.env.NEXT_PUBLIC_API_SERVER_URL || "http://localhost:3001";

type FormData = UserSignup;

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [generalError, setGeneralError] = useState<string>("")

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(UserSignupSchema)
  })

  const onSubmit = async (data: FormData) => {
    
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
        window.location.href = "/signin?message=Account created successfully. Please sign in."
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
    <div className="min-h-screen w-full bg-[var(--color-darkbg)] relative text-primary">
      
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 font-didact-gothic">
        <div className="w-full max-w-md">
        <Card className="bg-secondary   border border-gray-800 text-primary ">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center font-handlee text-primary">Create Account</CardTitle>
            <CardDescription className="text-center">
              Enter your information to create a new account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  {...register("name")}
                  className={`bg-tertiary text-secondary ${errors.name ? "border-red-500" : ""}`}
                />
                {errors.name && (
                  <p className="text-sm text-quaternary">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...register("email")}
                  className={`bg-tertiary text-secondary ${errors.email ? "border-red-500" : ""}`}
                />
                {errors.email && (
                  <p className="text-sm text-quaternary">{errors.email.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  {...register("password")}
                  className={`bg-tertiary text-secondary ${errors.password ? "border-red-500 " : ""}`}
                />
                {errors.password && (
                  <p className="text-sm text-quaternary">{errors.password.message}</p>
                )}
                <p className="text-xs text-tertiary">
                  Must be 8+ characters with uppercase, lowercase, and number
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  {...register("confirmPassword")}
                  className={`bg-tertiary text-secondary ${errors.confirmPassword ? "border-red-500" : ""}`}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-quaternary">{errors.confirmPassword.message}</p>
                )}
              </div>

              {generalError && (
                <div className="p-3 text-sm text-quaternary bg-red-50 border border-red-200 rounded-md ">
                  {generalError}
                </div>
              )}

              <Button type="submit" className="w-full font-bold bg-primary text-secondary" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
                <p className="text-sm text-tertiary">
                Already have an account?{" "}
                <a href="/signin" className="font-medium text-primary hover:text-tertiary underline">
                  Sign in
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
} 