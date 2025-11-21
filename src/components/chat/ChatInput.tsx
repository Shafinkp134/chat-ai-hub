import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={`border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${isMobile ? 'p-3' : 'p-4'}`}>
      <form onSubmit={handleSubmit} className={`${isMobile ? 'max-w-full' : 'max-w-3xl'} mx-auto`}>
        <div className={`flex ${isMobile ? 'gap-2' : 'gap-4'}`}>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('typeMessage')}
            className={`${isMobile ? 'min-h-[50px] max-h-[120px] text-sm' : 'min-h-[60px] max-h-[200px]'} resize-none border-border/50 focus-visible:ring-primary`}
            disabled={disabled}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!message.trim() || disabled}
            className={`${isMobile ? 'h-[50px] w-[50px]' : 'h-[60px] w-[60px]'} shrink-0 bg-gradient-to-br from-primary to-accent hover:opacity-90 transition-opacity shadow-lg`}
          >
            <Send className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;