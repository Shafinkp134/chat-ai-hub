import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User, Sparkles, Copy, Volume2, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  imageUrl?: string;
  mode?: "chat" | "image" | "edit";
}

interface ChatMessagesProps {
  messages: Message[];
  isStreaming: boolean;
}

const ChatMessages = ({ messages, isStreaming }: ChatMessagesProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (content: string, id: string) => {
    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(content);
    utterance.onend = () => setSpeakingId(null);
    window.speechSynthesis.speak(utterance);
    setSpeakingId(id);
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className={`text-center ${isMobile ? 'max-w-xs' : 'max-w-md'}`}>
          <div className="relative inline-block mb-6">
            <Bot className={`${isMobile ? 'h-16 w-16' : 'h-20 w-20'} text-primary animate-pulse`} />
            <div className="absolute inset-0 blur-2xl bg-primary/30 animate-pulse" />
          </div>
          <h2 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent`}>
            Start a new conversation
          </h2>
          <p className={`text-muted-foreground ${isMobile ? 'text-base' : 'text-lg'}`}>
            Ask me anything! I'm <span className="font-semibold text-primary">Cheetha</span>, your AI assistant here to help with questions, creative writing, analysis, and more.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1" ref={scrollRef}>
      <div className={`${isMobile ? 'max-w-full px-3 py-4' : 'max-w-3xl px-4 py-6'} mx-auto space-y-6`}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${isMobile ? 'gap-2' : 'gap-4'} ${
              message.role === "user" ? "flex-row-reverse" : ""
            }`}
          >
            <Avatar className={`${isMobile ? 'h-8 w-8' : 'h-10 w-10'} shrink-0 ring-2 ring-primary/20`}>
              <AvatarFallback className={message.role === "user" ? "bg-gradient-to-br from-primary to-accent" : "bg-gradient-to-br from-primary/90 to-accent/90"}>
                {message.role === "user" ? (
                  <User className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-white`} />
                ) : (
                  <Sparkles className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-white`} />
                )}
              </AvatarFallback>
            </Avatar>
            <div
              className={`flex-1 rounded-xl ${isMobile ? 'px-3 py-2' : 'px-5 py-4'} shadow-sm transition-all hover:shadow-md ${
                message.role === "user"
                  ? "bg-gradient-to-br from-primary to-accent text-primary-foreground"
                  : "bg-card border border-border/50"
              }`}
            >
              {message.role === "assistant" ? (
                <div className="space-y-3">
                  {message.imageUrl && (
                    <div className="relative rounded-lg overflow-hidden border border-border/30">
                      <img 
                        src={message.imageUrl} 
                        alt="Generated image" 
                        className="w-full h-auto"
                      />
                      <div className="absolute bottom-3 right-3 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm font-bold text-primary shadow-lg border border-primary/20">
                        CHEETHA
                      </div>
                    </div>
                  )}
                  <div className={`prose prose-sm dark:prose-invert max-w-none ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    <ReactMarkdown>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  <div className="flex gap-1 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(message.content, message.id)}
                      className="h-7 px-2 text-xs"
                    >
                      {copiedId === message.id ? (
                        <Check className="h-3 w-3 mr-1" />
                      ) : (
                        <Copy className="h-3 w-3 mr-1" />
                      )}
                      {!isMobile && (copiedId === message.id ? "Copied" : "Copy")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSpeak(message.content, message.id)}
                      className="h-7 px-2 text-xs"
                    >
                      <Volume2 className={`h-3 w-3 mr-1 ${speakingId === message.id ? 'text-primary' : ''}`} />
                      {!isMobile && (speakingId === message.id ? "Stop" : "Speak")}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} whitespace-pre-wrap`}>{message.content}</p>
              )}
            </div>
          </div>
        ))}
        {isStreaming && (
          <div className={`flex ${isMobile ? 'gap-2' : 'gap-4'}`}>
            <Avatar className={`${isMobile ? 'h-8 w-8' : 'h-10 w-10'} shrink-0 ring-2 ring-primary/20`}>
              <AvatarFallback className="bg-gradient-to-br from-primary/90 to-accent/90">
                <Sparkles className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-white`} />
              </AvatarFallback>
            </Avatar>
            <div className={`flex-1 rounded-xl ${isMobile ? 'px-3 py-2' : 'px-5 py-4'} bg-card border border-border/50 shadow-sm`}>
              <div className="flex gap-1.5">
                <div className={`${isMobile ? 'w-2 h-2' : 'w-2.5 h-2.5'} rounded-full bg-primary animate-bounce shadow-glow`} style={{ animationDelay: "0ms" }} />
                <div className={`${isMobile ? 'w-2 h-2' : 'w-2.5 h-2.5'} rounded-full bg-accent animate-bounce shadow-glow`} style={{ animationDelay: "150ms" }} />
                <div className={`${isMobile ? 'w-2 h-2' : 'w-2.5 h-2.5'} rounded-full bg-primary animate-bounce shadow-glow`} style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default ChatMessages;