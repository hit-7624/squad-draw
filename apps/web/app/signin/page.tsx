"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Button } from "../../components/ui/button"
import { UserLoginSchema, type UserLogin } from "@repo/schemas/types"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

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
  } = useForm<UserLogin>({
    resolver: zodResolver(UserLoginSchema)
  })

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const message = urlParams.get('message')
    if (message) {
      setSuccessMessage(message)
    }
  }, [])

  const onSubmit = async (data: UserLogin) => {
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
        router.push("/")
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
    <div className="min-h-screen w-full bg-darkbg relative text-primary">
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 font-didact-gothic">
        <div className="w-full max-w-md">
        <Card className="bg-secondary border border-gray-800 text-primary">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center font-handlee text-primary ">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                  placeholder="Enter your password"
                  {...register("password")}
                  className={`bg-tertiary text-secondary ${errors.password ? "border-red-500 " : ""}`}
                />
                {errors.password && (
                  <p className="text-sm text-quaternary">{errors.password.message}</p>
                )}
              </div>

              {successMessage && (
                <div className="p-3 text-sm text-primary bg-green-50 border">
                  {successMessage}
                </div>
              )}

              {generalError && (
                <div className="p-3 text-sm text-quaternary bg-red-50 border border-red-200 rounded-md">
                  {generalError}
                </div>
              )}

              <Button type="submit" className="w-full font-bold bg-primary text-secondary" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-tertiary">
                Don't have an account?{" "}
                <a href="/signup" className="font-medium text-primary hover:text-tertiary underline">
                  Sign up
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