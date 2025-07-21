"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Users, X } from "lucide-react";
import { useRoomStore } from "@/store/room.store";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface GroupChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GroupChatbot({ isOpen, onClose }: GroupChatbotProps) {
  const { data: session } = authClient.useSession();
  const { messages, onlineMembers, sendMessage } = useRoomStore();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || !session?.user) return;
    await sendMessage(input, session.user);
    setInput("");
  };
  
  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 h-[500px] w-[calc(100%-2rem)] md:h-[600px] md:w-96 md:bottom-24 md:right-6 transition-all duration-300 ease-in-out z-30",
        isOpen
          ? "translate-y-0 opacity-100"
          : "translate-y-[110%] opacity-0 pointer-events-none",
      )}
    >
      <Card className="h-full shadow-2xl border bg-card text-card-foreground flex flex-col rounded-xl overflow-hidden gap-0 py-0">
        <div className="px-3 py-2 bg-muted/30 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Users className="h-5 w-5 text-primary" />
              <span>Room Chat</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground font-medium">
                {onlineMembers.length} online
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-muted"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
          <div className="px-3 py-1.5 border-b bg-muted/20 flex-shrink-0">
            <h3 className="text-xs font-semibold text-foreground mb-1.5">
              Online Users
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {onlineMembers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-1.5 bg-background/60 border rounded-full px-2 py-1 text-xs"
                >
                  <Avatar className="h-5 w-5 border border-primary/30">
                    <AvatarFallback className="bg-primary/20 text-primary font-semibold text-xs">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-foreground font-medium whitespace-nowrap">
                    {user.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                {messages.map((msg, index) => {
                  const isYou = msg.user?.id === session?.user?.id;
                  const messageDate = new Date(msg.createdAt);
                  const today = new Date();
                  const isToday = messageDate.getDate() === today.getDate() &&
                                  messageDate.getMonth() === today.getMonth() &&
                                  messageDate.getFullYear() === today.getFullYear();
                  
                  return (
                    <div
                      key={index}
                      className={cn(
                        "flex gap-3",
                        isYou ? "flex-row-reverse" : "flex-row",
                      )}
                    >
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
                          {isYou
                            ? session?.user?.name?.charAt(0)?.toUpperCase() ||
                              "Y"
                            : msg.user?.name?.charAt(0)?.toUpperCase() ||
                              msg.user?.id?.charAt(0)?.toUpperCase() ||
                              "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={cn(
                          "flex flex-col max-w-[250px] min-w-0",
                          isYou ? "items-end" : "items-start",
                        )}
                      >
                        <div
                          className={cn(
                            "flex items-baseline gap-2 mb-1",
                            isYou ? "flex-row-reverse" : "flex-row",
                          )}
                        >
                          <span className="text-xs font-semibold text-foreground">
                            {isYou ? "You" : msg.user?.name || "Anonymous"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {isToday 
                              ? messageDate.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                              : messageDate.toLocaleDateString([], {
                                  year: 'numeric', month: 'long', day: 'numeric' 
                              })
                            }
                          </span>
                        </div>
                        <div
                          className={cn(
                            "rounded-lg px-3 py-2 text-sm break-words word-wrap",
                            isYou
                              ? "bg-primary text-primary-foreground rounded-br-sm"
                              : "bg-muted text-foreground rounded-bl-sm",
                          )}
                        >
                          {msg.message}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>
          </div>
        </CardContent>

        <CardFooter className="p-4 border-t bg-muted/20">
          <form onSubmit={onSubmit} className="flex w-full items-center gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-background border focus:ring-2 focus:ring-primary/20 rounded-lg"
              autoComplete="off"
            />
            <Button
              type="submit"
              size="icon"
              className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
              disabled={!input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}