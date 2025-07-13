"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Users, X } from "lucide-react"
import { useRoomStore } from "@/store/room.store"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

interface GroupChatbotProps {
  isOpen: boolean
  onClose: () => void
}

export function GroupChatbot({ isOpen, onClose }: GroupChatbotProps) {
  const { data: session } = authClient.useSession()
  const { messages, onlineMembers, members, sendMessage } = useRoomStore()
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim() || !session?.user) return
    await sendMessage(input, session.user)
    setInput("")
  }

  const onlineUsers = onlineMembers.map((userId) => {
    const memberName = (members ?? []).find((m) => m.id === userId)?.name ?? '';
    let displayName = memberName ? (memberName.length > 5 ? memberName.slice(0, 5) + '..' : memberName) : `User ${userId.slice(0, 4)}`;
    return {
      id: userId,
      name: displayName,
    }
  })

  return (
    <div
      className={cn(
        "fixed bottom-24 right-6 w-96 h-[600px] transition-all duration-300 ease-in-out z-30",
        isOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
      )}
    >
      <Card className="h-full shadow-2xl border-border bg-card text-card-foreground flex flex-col rounded-xl">
        <CardHeader className="pb-3 bg-muted/50 rounded-t-xl">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-medium">
              <Users className="h-5 w-5 text-primary" />
              <span>Room Chat</span>
            </CardTitle>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{onlineUsers.length} online</span>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-border flex-shrink-0">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Online Users</h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {onlineUsers.map((user) => (
                <div key={user.id} className="flex flex-col items-center gap-1 flex-shrink-0">
                  <Avatar className="h-10 w-10 border-2 border-border">
                    <AvatarFallback className="bg-muted text-muted-foreground">{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{user.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                {messages.map((msg, index) => {
                const isYou = msg.user?.id === session?.user?.id
                return (
                  <div
                    key={index}
                    className={cn("flex items-start gap-2 mb-4", isYou ? "justify-end" : "justify-start")}
                  >
                    <div className="flex items-start gap-2">
                      {!isYou && (
                        <Avatar className="h-8 w-8 mt-1">
                          <AvatarFallback>{msg.user?.name?.charAt(0) || msg.user?.id?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className={cn("max-w-[280px] flex-1", isYou && "order-1")}>
                        <div className="flex items-baseline gap-2">
                          <span className={cn("text-sm font-medium", isYou ? "text-primary" : "text-muted-foreground")}>{isYou ? "You" : msg.user?.name || "Anonymous"}</span>
                          <span className="text-xs text-muted-foreground">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div
                          className={cn(
                            "mt-1 rounded-2xl px-4 py-2 text-sm block w-full",
                            isYou
                              ? "bg-primary text-primary-foreground rounded-br-none"
                              : "bg-muted text-muted-foreground rounded-bl-none"
                          )}
                        >
                          <p className="break-words whitespace-pre-wrap overflow-wrap-anywhere">{msg.message}</p>
                        </div>
                      </div>
                      {isYou && (
                        <Avatar className="h-8 w-8 mt-1">
                          <AvatarFallback>{session?.user?.name?.charAt(0) || session?.user?.id?.charAt(0) || 'Y'}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                )                })}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>
          </div>
        </CardContent>

        <CardFooter className="p-3 border-t border-border bg-muted/50 rounded-b-xl">
          <form onSubmit={onSubmit} className="flex w-full items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-background border-border rounded-full focus:ring-ring focus:ring-2"
              autoComplete="off"
            />
            <Button type="submit" size="icon" className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}