import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Plus, LogOut, CreditCard, Menu, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

interface ChatSidebarProps {
  currentConversationId: string | null;
}

const ChatSidebar = ({ currentConversationId }: ChatSidebarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadConversations();
  }, [currentConversationId]);

  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error: any) {
      console.error("Error loading conversations:", error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleNewChat = () => {
    navigate("/chat");
    setIsOpen(false);
  };

  const handleConversationClick = (id: string) => {
    navigate(`/chat/${id}`);
    setIsOpen(false);
  };

  return (
    <>
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      )}

      <div
        className={`${
          isMobile
            ? `fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300 ease-in-out ${
                isOpen ? "translate-x-0" : "-translate-x-full"
              }`
            : "relative w-64"
        } bg-sidebar border-r border-sidebar-border`}
      >
        <div className="flex flex-col h-full">
          <div className={`${isMobile ? 'p-3' : 'p-4'} border-b border-sidebar-border`}>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-primary`} />
              <h1 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold`}>Cheetha</h1>
            </div>
            <Button onClick={handleNewChat} className="w-full" variant="default" size={isMobile ? "sm" : "default"}>
              <Plus className="h-4 w-4 mr-2" />
              {t('newChat')}
            </Button>
          </div>

          <ScrollArea className="flex-1 p-2">
            <div className="space-y-1">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => handleConversationClick(conversation.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    currentConversationId === conversation.id
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                  }`}
                >
                  <div className="truncate">{conversation.title}</div>
                </button>
              ))}
            </div>
          </ScrollArea>

          <div className={`${isMobile ? 'p-3' : 'p-4'} border-t border-sidebar-border space-y-2`}>
            <Button
              variant="ghost"
              className="w-full justify-start"
              size={isMobile ? "sm" : "default"}
              onClick={() => {
                navigate("/pricing");
                setIsOpen(false);
              }}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {t('upgradePlan')}
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              size={isMobile ? "sm" : "default"}
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {t('logout')}
            </Button>
          </div>
        </div>
      </div>

      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default ChatSidebar;