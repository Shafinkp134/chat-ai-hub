import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Wrench } from "lucide-react";

interface MaintenanceCheckProps {
  children: React.ReactNode;
}

const MaintenanceCheck = ({ children }: MaintenanceCheckProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkMaintenanceAndAuth();
  }, []);

  const checkMaintenanceAndAuth = async () => {
    try {
      // Check maintenance mode
      const { data: maintenanceData } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "maintenance_mode")
        .maybeSingle();

      const maintenanceEnabled = maintenanceData?.value === true;
      setIsMaintenanceMode(maintenanceEnabled);

      if (maintenanceEnabled) {
        // Check if user is admin
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .eq("role", "admin")
            .maybeSingle();

          setIsAdmin(!!roleData);
        }
      }
    } catch (error) {
      console.error("Error checking maintenance mode:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isMaintenanceMode && !isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center px-4 max-w-md">
          <Wrench className="h-16 w-16 mx-auto mb-6 text-primary" />
          <h1 className="text-3xl font-bold mb-4">Maintenance Mode</h1>
          <p className="text-muted-foreground mb-6">
            We're currently performing maintenance to improve Stechy AI. We'll be back shortly!
          </p>
          <p className="text-sm text-muted-foreground">
            Thank you for your patience.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default MaintenanceCheck;
