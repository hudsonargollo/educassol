import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Message {
  id: string
  content: string
  sender: "user" | "support"
  timestamp: Date
}

interface SupportChatProps {
  isOnline?: boolean
  className?: string
}

function ChatMessage({ message }: { message: Message }) {
  const isUser = message.sender === "user"
  
  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-3 py-2 text-sm",
          isUser
            ? "bg-examai-purple-500 text-white"
            : "bg-muted text-foreground dark:bg-examai-navy-800"
        )}
      >
        <p>{message.content}</p>
        <span className={cn(
          "text-xs mt-1 block",
          isUser ? "text-white/70" : "text-muted-foreground"
        )}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  )
}

export function SupportChat({ isOnline = true, className }: SupportChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hello! How can I help you today?",
      sender: "support",
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: "user",
      timestamp: new Date()
    }

    setMessages((prev) => [...prev, newMessage])
    setInputValue("")

    // Simulate support response
    setTimeout(() => {
      const supportResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "Thanks for your message! Our team will get back to you shortly.",
        sender: "support",
        timestamp: new Date()
      }
      setMessages((prev) => [...prev, supportResponse])
    }, 1000)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50",
          "h-14 w-14 rounded-full",
          "bg-examai-purple-500 hover:bg-examai-purple-600",
          "flex items-center justify-center",
          "shadow-lg shadow-examai-purple-500/25",
          "transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-examai-purple-500 focus:ring-offset-2",
          isOpen && "hidden",
          className
        )}
        aria-label="Open support chat"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50",
            "w-80 sm:w-96 rounded-xl overflow-hidden",
            "bg-card border border-border",
            "shadow-xl shadow-black/20",
            "dark:bg-examai-navy-900 dark:border-examai-purple-500/20",
            "flex flex-col"
          )}
        >
          {/* Header */}
          <div className="p-4 border-b border-border dark:border-examai-navy-700 flex items-center justify-between bg-card dark:bg-examai-navy-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-examai-purple-500/10">
                <GraduationCap className="h-5 w-5 text-examai-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Support Chat</h3>
                <p className="text-xs text-muted-foreground">
                  Ask me anything about the platform
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-medium",
                  isOnline
                    ? "bg-green-500/10 text-green-500"
                    : "bg-gray-500/10 text-gray-500"
                )}
              >
                {isOnline ? "● Online" : "○ Offline"}
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-examai-purple-500"
                aria-label="Close support chat"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="h-64 overflow-y-auto p-4 space-y-4 bg-background dark:bg-examai-navy-950">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border dark:border-examai-navy-700 bg-card dark:bg-examai-navy-800">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Type your question..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
                aria-label="Chat message input"
              />
              <Button
                onClick={handleSendMessage}
                size="icon"
                disabled={!inputValue.trim()}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              ✨ Powered by ExamAI Support
            </p>
          </div>
        </div>
      )}
    </>
  )
}

export default SupportChat
