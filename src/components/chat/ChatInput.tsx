import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, MessageSquare, Wand2, ImagePlus, X, Sparkles } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string, file?: File) => void;
  disabled?: boolean;
  mode: "chat" | "image" | "edit";
  onModeChange: (mode: "chat" | "image" | "edit") => void;
  onFileUpload?: (file: File) => void;
  uploadedImage?: string | null;
}

const ChatInput = ({ onSend, disabled, mode, onModeChange, onFileUpload, uploadedImage }: ChatInputProps) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [message, setMessage] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message, uploadedFile || undefined);
      setMessage("");
      setUploadedFile(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileUpload) {
      onFileUpload(file);
      setUploadedFile(file);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const clearUpload = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onModeChange("chat");
  };

  const modeConfig = {
    chat: {
      icon: MessageSquare,
      label: "Chat",
      description: "Powered by Gemini 1.5",
      gradient: "from-blue-500 to-cyan-500",
    },
    image: {
      icon: Wand2,
      label: "Create",
      description: "Image Ideas",
      gradient: "from-purple-500 to-pink-500",
    },
    edit: {
      icon: ImagePlus,
      label: "Edit",
      description: "Transform Images",
      gradient: "from-orange-500 to-red-500",
    },
  };

  return (
    <div className={`border-t border-border/40 bg-gradient-to-t from-background via-background to-background/80 backdrop-blur-xl ${isMobile ? 'p-3' : 'p-4 pb-6'}`}>
      <form onSubmit={handleSubmit} className={`${isMobile ? 'max-w-full' : 'max-w-3xl'} mx-auto space-y-3`}>
        {/* Mode Selector */}
        <div className="flex gap-2">
          {(Object.keys(modeConfig) as Array<keyof typeof modeConfig>).map((key) => {
            const config = modeConfig[key];
            const Icon = config.icon;
            const isActive = mode === key;
            
            return (
              <button
                key={key}
                type="button"
                onClick={() => key === "edit" ? fileInputRef.current?.click() : onModeChange(key)}
                className={`flex-1 relative group overflow-hidden rounded-xl transition-all duration-300 ${
                  isActive 
                    ? `bg-gradient-to-br ${config.gradient} text-white shadow-lg shadow-primary/20` 
                    : 'bg-card/50 hover:bg-card border border-border/50 hover:border-primary/30'
                } ${isMobile ? 'p-2' : 'p-3'}`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Icon className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} ${isActive ? 'animate-pulse' : ''}`} />
                  <div className="text-left">
                    <div className={`font-semibold ${isMobile ? 'text-xs' : 'text-sm'}`}>{config.label}</div>
                    {!isMobile && (
                      <div className={`text-[10px] ${isActive ? 'text-white/80' : 'text-muted-foreground'}`}>
                        {config.description}
                      </div>
                    )}
                  </div>
                </div>
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer" />
                )}
              </button>
            );
          })}
        </div>

        {/* Uploaded Image Preview */}
        {uploadedImage && (
          <div className="relative inline-block">
            <img 
              src={uploadedImage} 
              alt="To edit" 
              className="max-h-24 rounded-xl border-2 border-primary/30 shadow-lg" 
            />
            <button
              type="button"
              onClick={clearUpload}
              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-md hover:scale-110 transition-transform"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {uploadedFile && !uploadedImage && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
            <ImagePlus className="h-4 w-4 text-primary" />
            <span className="truncate">{uploadedFile.name}</span>
            <button
              type="button"
              onClick={clearUpload}
              className="ml-auto hover:text-destructive transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Input Area */}
        <div className={`flex ${isMobile ? 'gap-2' : 'gap-3'} items-end`}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
          <div className="flex-1 relative">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                mode === "edit" ? "Describe how to transform this image..." :
                mode === "image" ? "Describe the image you want to create..." : 
                t('typeMessage')
              }
              className={`${isMobile ? 'min-h-[50px] max-h-[120px] text-sm pr-4' : 'min-h-[56px] max-h-[200px] pr-4'} resize-none rounded-xl border-border/50 bg-card/80 focus-visible:ring-primary/50 focus-visible:ring-2 focus-visible:border-primary/50 transition-all placeholder:text-muted-foreground/60`}
              disabled={disabled}
            />
            <div className="absolute bottom-2 right-3 flex items-center gap-1 text-[10px] text-muted-foreground/50">
              <Sparkles className="h-3 w-3" />
              Gemini 1.5
            </div>
          </div>
          <Button
            type="submit"
            size="icon"
            disabled={!message.trim() || disabled}
            className={`${isMobile ? 'h-[50px] w-[50px]' : 'h-[56px] w-[56px]'} shrink-0 rounded-xl bg-gradient-to-br from-primary via-primary to-accent hover:shadow-lg hover:shadow-primary/30 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100`}
          >
            <Send className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;