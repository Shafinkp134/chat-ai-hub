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
  imageUrl?: string;
  mode?: "chat" | "image" | "edit";
}

const Chat = () => {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatMode, setChatMode] = useState<"chat" | "image" | "edit">("chat");
  const [isTemporary, setIsTemporary] = useState(false);
  const [remainingCredits, setRemainingCredits] = useState<number | null>(null);
  const [uploadedImageForEdit, setUploadedImageForEdit] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    loadUserCredits();
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

  const loadUserCredits = async () => {
    // Credits system will be enabled after migration is approved
    setRemainingCredits(null);
  };

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

  const handleSendMessage = async (content: string, uploadedFile?: File) => {
    let convId = currentConversationId;

    if (!isTemporary && !convId) {
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
      mode: chatMode,
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      if (!isTemporary && convId) {
        const { error: insertError } = await supabase
          .from("messages")
          .insert({
            conversation_id: convId,
            role: "user",
            content,
          });

        if (insertError) throw insertError;
      }

      setIsStreaming(true);

      // Image editing mode
      if (chatMode === "edit" && uploadedImageForEdit) {
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
            body: JSON.stringify({ 
              messages: messagesToSend, 
              mode: "edit",
              imageToEdit: uploadedImageForEdit 
            }),
          }
        );

        if (response.status === 403) {
          const data = await response.json();
          toast({
            title: "Daily limit reached",
            description: data.error,
            variant: "destructive",
          });
          setIsStreaming(false);
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.content,
          created_at: new Date().toISOString(),
          imageUrl: data.imageUrl,
          mode: "edit",
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setUploadedImageForEdit(null);
        await loadUserCredits();

        if (!isTemporary && convId) {
          await supabase.from("messages").insert({
            conversation_id: convId,
            role: "assistant",
            content: data.content,
          });
        }

        setIsStreaming(false);
        return;
      }

      // Image generation mode
      if (chatMode === "image") {
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
            body: JSON.stringify({ messages: messagesToSend, mode: "image" }),
          }
        );

        if (response.status === 403) {
          const data = await response.json();
          toast({
            title: "Daily limit reached",
            description: data.error,
            variant: "destructive",
          });
          setIsStreaming(false);
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        await loadUserCredits();
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.content,
          created_at: new Date().toISOString(),
          imageUrl: data.imageUrl,
          mode: "image",
        };

        setMessages((prev) => [...prev, assistantMessage]);

        if (!isTemporary && convId) {
          await supabase.from("messages").insert({
            conversation_id: convId,
            role: "assistant",
            content: data.content,
          });
        }

        setIsStreaming(false);
        return;
      }

      // Regular chat mode
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
          body: JSON.stringify({ messages: messagesToSend, mode: "chat" }),
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

      if (!isTemporary && convId) {
        await supabase.from("messages").insert({
          conversation_id: convId,
          role: "assistant",
          content: assistantContent,
        });
      }

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

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImageForEdit(e.target?.result as string);
      setChatMode("edit");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex h-screen flex-col">
      <ChatHeader 
        isTemporary={isTemporary} 
        onTemporaryChange={setIsTemporary}
        remainingCredits={remainingCredits}
      />
      <div className="flex flex-1 overflow-hidden">
        <ChatSidebar 
          currentConversationId={currentConversationId}
          onConversationDeleted={() => {
            navigate('/chat');
            setMessages([]);
            setCurrentConversationId(null);
          }}
        />
        <div className="flex-1 flex flex-col">
          <ChatMessages messages={messages} isStreaming={isStreaming} />
          <ChatInput 
            onSend={handleSendMessage} 
            disabled={isStreaming} 
            mode={chatMode}
            onModeChange={setChatMode}
            onFileUpload={handleFileUpload}
            uploadedImage={uploadedImageForEdit}
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;