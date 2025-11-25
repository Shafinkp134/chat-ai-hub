import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";
import { Button } from "./ui/button";

export default function EventBanner() {
  const [banner, setBanner] = useState<any>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    loadBanner();

    // Subscribe to banner changes
    const channel = supabase
      .channel('event_banners_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_banners'
        },
        () => loadBanner()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadBanner = async () => {
    const { data } = await supabase
      .from("event_banners")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      setBanner(data[0]);
      setDismissed(false);
    } else {
      setBanner(null);
    }
  };

  if (!banner || dismissed) return null;

  return (
    <div
      className="w-full py-3 px-4 flex items-center justify-between"
      style={{
        backgroundColor: banner.bg_color,
        color: banner.text_color
      }}
    >
      <div className="flex-1 text-center">
        <span className="font-bold mr-2">{banner.title}</span>
        <span>{banner.message}</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setDismissed(true)}
        className="hover:bg-black/10"
        style={{ color: banner.text_color }}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
