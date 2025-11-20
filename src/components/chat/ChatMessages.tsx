import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface ChatMessagesProps {
  messages: Message[];
  isStreaming: boolean;
}

const ChatMessages = ({ messages, isStreaming }: ChatMessagesProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="relative inline-block mb-6">
            <Bot className="h-20 w-20 text-primary animate-pulse" />
            <div className="absolute inset-0 blur-2xl bg-primary/30 animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Start a new conversation
          </h2>
          <p className="text-muted-foreground text-lg">
            Ask me anything! I'm <span className="font-semibold text-primary">Cheetha</span>, your AI assistant here to help with questions, creative writing, analysis, and more.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 p-4" ref={scrollRef}>
      <div className="max-w-3xl mx-auto space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-4 ${
              message.role === "user" ? "flex-row-reverse" : ""
            }`}
          >
            <Avatar className="h-10 w-10 shrink-0 ring-2 ring-primary/20">
              <AvatarFallback className={message.role === "user" ? "bg-gradient-to-br from-primary to-accent" : "bg-gradient-to-br from-primary/90 to-accent/90"}>
                {message.role === "user" ? (
                  <User className="h-5 w-5 text-white" />
                ) : (
                  <Sparkles className="h-5 w-5 text-white" />
                )}
              </AvatarFallback>
            </Avatar>
            <div
              className={`flex-1 rounded-xl px-5 py-4 shadow-sm transition-all hover:shadow-md ${
                message.role === "user"
                  ? "bg-gradient-to-br from-primary to-accent text-primary-foreground"
                  : "bg-card border border-border/50"
              }`}
            >
              {message.role === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                  <ReactMarkdown>
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              )}
            </div>
          </div>
        ))}
        {isStreaming && (
          <div className="flex gap-4">
            <Avatar className="h-10 w-10 shrink-0 ring-2 ring-primary/20">
              <AvatarFallback className="bg-gradient-to-br from-primary/90 to-accent/90">
                <Sparkles className="h-5 w-5 text-white" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 rounded-xl px-5 py-4 bg-card border border-border/50 shadow-sm">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce shadow-glow" style={{ animationDelay: "0ms" }} />
                <div className="w-2.5 h-2.5 rounded-full bg-accent animate-bounce shadow-glow" style={{ animationDelay: "150ms" }} />
                <div className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce shadow-glow" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default ChatMessages;