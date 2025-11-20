import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const { t } = useTranslation();
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
    <div className="border-t border-border/40 p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        <div className="flex gap-4">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('typeMessage')}
            className="min-h-[60px] max-h-[200px] resize-none border-border/50 focus-visible:ring-primary"
            disabled={disabled}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!message.trim() || disabled}
            className="h-[60px] w-[60px] shrink-0 bg-gradient-to-br from-primary to-accent hover:opacity-90 transition-opacity shadow-lg"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;