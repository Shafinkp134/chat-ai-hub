import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, Settings, CreditCard, User, Languages, Sparkles, Clock } from "lucide-react";

interface ChatHeaderProps {
  isTemporary?: boolean;
  onTemporaryChange?: (value: boolean) => void;
}

const ChatHeader = ({ isTemporary, onTemporaryChange }: ChatHeaderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
    toast({
      title: "Logged out successfully",
    });
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    toast({
      title: "Language changed",
      description: `Language switched to ${lng.toUpperCase()}`,
    });
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'zh', name: '中文' },
    { code: 'ja', name: '日本語' },
    { code: 'ar', name: 'العربية' },
  ];

  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className={`flex ${isMobile ? 'h-14' : 'h-16'} items-center justify-between ${isMobile ? 'px-16' : 'px-6'}`}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Sparkles className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-primary animate-pulse`} />
            <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse" />
          </div>
          <div>
            <h1 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient`}>
              {t('appName')}
            </h1>
            {!isMobile && <p className="text-xs text-muted-foreground">Your AI Assistant</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={isTemporary ? "default" : "outline"}
            size={isMobile ? "sm" : "default"}
            onClick={() => onTemporaryChange?.(!isTemporary)}
            className={isMobile ? "text-xs" : ""}
          >
            <Clock className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
            {isMobile ? "" : "Temporary"}
          </Button>
          {!isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/pricing")}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {t('pricing')}
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Avatar className={`${isMobile ? 'h-7 w-7' : 'h-8 w-8'} ring-2 ring-primary/20`}>
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent">
                    <User className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Languages className="mr-2 h-4 w-4" />
                  <span>{t('language')}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={i18n.language === lang.code ? "bg-accent" : ""}
                    >
                      {lang.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuItem onClick={() => navigate("/pricing")}>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>{t('pricing')}</span>
              </DropdownMenuItem>

              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>{t('settings')}</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t('logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
