import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";
import ChatHeader from "@/components/chat/ChatHeader";
import { Loader2 } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

const Chat = () => {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId);
    } else {
      setMessages([]);
      setCurrentConversationId(null);
      setLoading(false);
    }
  }, [conversationId]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const loadConversation = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      
      const typedMessages = (data || []).map(msg => ({
        id: msg.id,
        role: msg.role as "user" | "assistant",
        content: msg.content,
        created_at: msg.created_at
      }));
      
      setMessages(typedMessages);
      setCurrentConversationId(id);
    } catch (error: any) {
      toast({
        title: "Error loading conversation",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (firstMessage: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: conversation, error } = await supabase
        .from("conversations")
        .insert({
          user_id: user.id,
          title: firstMessage.slice(0, 50),
        })
        .select()
        .single();

      if (error) throw error;
      return conversation.id;
    } catch (error: any) {
      toast({
        title: "Error creating conversation",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const handleSendMessage = async (content: string) => {
    let convId = currentConversationId;

    if (!convId) {
      convId = await createConversation(content);
      if (!convId) return;
      setCurrentConversationId(convId);
      navigate(`/chat/${convId}`);
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const { error: insertError } = await supabase
        .from("messages")
        .insert({
          conversation_id: convId,
          role: "user",
          content,
        });

      if (insertError) throw insertError;

      setIsStreaming(true);
      const allMessages = [...messages, userMessage];
      const messagesToSend = allMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ messages: messagesToSend }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  assistantContent += content;
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage.role === "assistant") {
                      lastMessage.content = assistantContent;
                    }
                    return newMessages;
                  });
                }
              } catch (e) {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        }
      }

      await supabase.from("messages").insert({
        conversation_id: convId,
        role: "assistant",
        content: assistantContent,
      });

    } catch (error: any) {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsStreaming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <ChatHeader />
      <div className="flex flex-1 overflow-hidden">
        <ChatSidebar currentConversationId={currentConversationId} />
        <div className="flex-1 flex flex-col">
          <ChatMessages messages={messages} isStreaming={isStreaming} />
          <ChatInput onSend={handleSendMessage} disabled={isStreaming} />
        </div>
      </div>
    </div>
  );
};

export default Chat;