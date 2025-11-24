import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Plus, LogOut, CreditCard, Menu, X, Trash2, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

interface ChatSidebarProps {
  currentConversationId: string | null;
  onConversationDeleted?: () => void;
}

const ChatSidebar = ({ currentConversationId, onConversationDeleted }: ChatSidebarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadConversations();
    checkAdminStatus();
  }, [currentConversationId]);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      setIsAdmin(!!roles);
    } catch (error) {
      setIsAdmin(false);
    }
  };

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

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setConversationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!conversationToDelete) return;

    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationToDelete);

      if (error) throw error;

      toast({
        title: "Conversation deleted",
        description: "The conversation has been deleted successfully.",
      });

      setConversations(prev => prev.filter(c => c.id !== conversationToDelete));

      if (conversationToDelete === currentConversationId && onConversationDeleted) {
        onConversationDeleted();
      }

      setDeleteDialogOpen(false);
      setConversationToDelete(null);
    } catch (error: any) {
      toast({
        title: "Error deleting conversation",
        description: error.message,
        variant: "destructive",
      });
    }
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
                <div
                  key={conversation.id}
                  className={`group relative w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    currentConversationId === conversation.id
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                  }`}
                >
                  <button
                    onClick={() => handleConversationClick(conversation.id)}
                    className="w-full text-left pr-8"
                  >
                    <div className="truncate">{conversation.title}</div>
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(e, conversation.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className={`${isMobile ? 'p-3' : 'p-4'} border-t border-sidebar-border space-y-2`}>
            {isAdmin && (
              <Button
                variant="ghost"
                className="w-full justify-start"
                size={isMobile ? "sm" : "default"}
                onClick={() => {
                  navigate("/admin");
                  setIsOpen(false);
                }}
              >
                <Settings className="h-4 w-4 mr-2" />
                Admin Panel
              </Button>
            )}
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this conversation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ChatSidebar;