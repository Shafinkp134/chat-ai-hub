import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AlertCircle, LogOut, Settings, Users, Bell, Wrench, CreditCard } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Admin() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  
  // Banner form
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerMessage, setBannerMessage] = useState("");
  const [bannerBgColor, setBannerBgColor] = useState("#3b82f6");
  const [bannerTextColor, setBannerTextColor] = useState("#ffffff");

  // Payment settings
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [stripePublishableKey, setStripePublishableKey] = useState("");
  const [pricingTiers, setPricingTiers] = useState({
    free: { credits: "10", price: "0" },
    pro: { credits: "100", price: "9.99" },
    enterprise: { credits: "1000", price: "49.99" }
  });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (!roles) {
        toast.error("Access denied. Admin only.");
        navigate("/");
        return;
      }

      setIsAdmin(true);
      loadData();
    } catch (error) {
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    // Load users with profiles
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (profilesData) {
      // Load roles for each user
      const usersWithRoles = await Promise.all(
        profilesData.map(async (profile) => {
          const { data: rolesData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", profile.id);
          
          return {
            ...profile,
            roles: rolesData?.map(r => r.role) || []
          };
        })
      );
      setUsers(usersWithRoles);
    }

    // Load banners
    const { data: bannersData } = await supabase
      .from("event_banners")
      .select("*")
      .order("created_at", { ascending: false });
    if (bannersData) setBanners(bannersData);

    // Load maintenance mode
    const { data: settingsData } = await supabase
      .from("site_settings")
      .select("*")
      .eq("key", "maintenance_mode")
      .single();
    
    if (settingsData && settingsData.value && typeof settingsData.value === 'object') {
      const value = settingsData.value as any;
      setMaintenanceMode(value.enabled || false);
      setMaintenanceMessage(value.message || "");
    }

    // Load payment settings
    const { data: paymentSettings } = await supabase
      .from("site_settings")
      .select("*")
      .eq("key", "payment_settings")
      .single();
    
    if (paymentSettings && paymentSettings.value && typeof paymentSettings.value === 'object') {
      const value = paymentSettings.value as any;
      setStripeEnabled(value.stripe_enabled || false);
      setStripePublishableKey(value.stripe_publishable_key || "");
      if (value.pricing_tiers) {
        setPricingTiers(value.pricing_tiers);
      }
    }
  };

  const handleCreateBanner = async () => {
    if (!bannerTitle || !bannerMessage) {
      toast.error("Please fill in all banner fields");
      return;
    }

    const { error } = await supabase.from("event_banners").insert({
      title: bannerTitle,
      message: bannerMessage,
      bg_color: bannerBgColor,
      text_color: bannerTextColor,
      is_active: true
    });

    if (error) {
      toast.error("Failed to create banner");
    } else {
      toast.success("Banner created successfully");
      setBannerTitle("");
      setBannerMessage("");
      loadData();
    }
  };

  const handleToggleBanner = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from("event_banners")
      .update({ is_active: !isActive })
      .eq("id", id);

    if (error) {
      toast.error("Failed to toggle banner");
    } else {
      toast.success("Banner updated");
      loadData();
    }
  };

  const handleDeleteBanner = async (id: string) => {
    const { error } = await supabase
      .from("event_banners")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete banner");
    } else {
      toast.success("Banner deleted");
      loadData();
    }
  };

  const handleMaintenanceModeToggle = async (enabled: boolean) => {
    const { error } = await supabase
      .from("site_settings")
      .update({
        value: { enabled, message: maintenanceMessage }
      })
      .eq("key", "maintenance_mode");

    if (error) {
      toast.error("Failed to update maintenance mode");
    } else {
      setMaintenanceMode(enabled);
      toast.success(`Maintenance mode ${enabled ? 'enabled' : 'disabled'}`);
    }
  };

  const handleUpdateMaintenanceMessage = async () => {
    const { error } = await supabase
      .from("site_settings")
      .update({
        value: { enabled: maintenanceMode, message: maintenanceMessage }
      })
      .eq("key", "maintenance_mode");

    if (error) {
      toast.error("Failed to update message");
    } else {
      toast.success("Maintenance message updated");
    }
  };

  const handleAssignRole = async (userId: string, role: 'admin' | 'moderator' | 'user') => {
    const { error } = await supabase.from("user_roles").insert({
      user_id: userId,
      role: role
    });

    if (error) {
      toast.error("Failed to assign role");
    } else {
      toast.success("Role assigned");
      loadData();
    }
  };

  const handleRemoveRole = async (userId: string, role: 'admin' | 'moderator' | 'user') => {
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", role);

    if (error) {
      toast.error("Failed to remove role");
    } else {
      toast.success("Role removed");
      loadData();
    }
  };

  const handleSavePaymentSettings = async () => {
    const { error } = await supabase
      .from("site_settings")
      .upsert({
        key: "payment_settings",
        value: {
          stripe_enabled: stripeEnabled,
          stripe_publishable_key: stripePublishableKey,
          pricing_tiers: pricingTiers
        }
      }, { onConflict: "key" });

    if (error) {
      toast.error("Failed to save payment settings");
    } else {
      toast.success("Payment settings saved successfully");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Admin Panel</h1>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="banners">
              <Bell className="h-4 w-4 mr-2" />
              Event Banners
            </TabsTrigger>
            <TabsTrigger value="payments">
              <CreditCard className="h-4 w-4 mr-2" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="maintenance">
              <Wrench className="h-4 w-4 mr-2" />
              Maintenance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user roles and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.full_name || "N/A"}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {user.roles.length > 0 ? (
                              user.roles.map((role: string) => (
                                <Badge key={role} variant="secondary">
                                  {role}
                                </Badge>
                              ))
                            ) : (
                              <Badge variant="outline">user</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {!user.roles.includes('admin') && (
                              <Button
                                size="sm"
                                onClick={() => handleAssignRole(user.id, 'admin')}
                              >
                                Make Admin
                              </Button>
                            )}
                            {user.roles.includes('admin') && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRemoveRole(user.id, 'admin')}
                              >
                                Remove Admin
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="banners">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create Event Banner</CardTitle>
                  <CardDescription>Add a new announcement banner</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="banner-title">Title</Label>
                    <Input
                      id="banner-title"
                      value={bannerTitle}
                      onChange={(e) => setBannerTitle(e.target.value)}
                      placeholder="New Feature Launch!"
                    />
                  </div>
                  <div>
                    <Label htmlFor="banner-message">Message</Label>
                    <Textarea
                      id="banner-message"
                      value={bannerMessage}
                      onChange={(e) => setBannerMessage(e.target.value)}
                      placeholder="Check out our latest updates..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bg-color">Background Color</Label>
                      <Input
                        id="bg-color"
                        type="color"
                        value={bannerBgColor}
                        onChange={(e) => setBannerBgColor(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="text-color">Text Color</Label>
                      <Input
                        id="text-color"
                        type="color"
                        value={bannerTextColor}
                        onChange={(e) => setBannerTextColor(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button onClick={handleCreateBanner}>Create Banner</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Banners</CardTitle>
                  <CardDescription>Manage existing announcement banners</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {banners.map((banner) => (
                      <div
                        key={banner.id}
                        className="p-4 rounded-lg border"
                        style={{
                          backgroundColor: banner.bg_color,
                          color: banner.text_color
                        }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-bold">{banner.title}</h3>
                            <p className="text-sm mt-1">{banner.message}</p>
                          </div>
                          <Badge variant={banner.is_active ? "default" : "secondary"}>
                            {banner.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleToggleBanner(banner.id, banner.is_active)}
                          >
                            {banner.is_active ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteBanner(banner.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment System Settings</CardTitle>
                <CardDescription>Configure payment processing and pricing tiers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="stripe-toggle">Enable Stripe Payments</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow users to purchase credits via Stripe
                    </p>
                  </div>
                  <Switch
                    id="stripe-toggle"
                    checked={stripeEnabled}
                    onCheckedChange={setStripeEnabled}
                  />
                </div>

                {stripeEnabled && (
                  <div>
                    <Label htmlFor="stripe-key">Stripe Publishable Key</Label>
                    <Input
                      id="stripe-key"
                      type="text"
                      value={stripePublishableKey}
                      onChange={(e) => setStripePublishableKey(e.target.value)}
                      placeholder="pk_live_..."
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Your Stripe publishable key (starts with pk_)
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="font-semibold">Pricing Tiers</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Free Tier</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label htmlFor="free-credits">Credits</Label>
                          <Input
                            id="free-credits"
                            type="number"
                            value={pricingTiers.free.credits}
                            onChange={(e) => setPricingTiers({
                              ...pricingTiers,
                              free: { ...pricingTiers.free, credits: e.target.value }
                            })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="free-price">Price ($)</Label>
                          <Input
                            id="free-price"
                            type="number"
                            value={pricingTiers.free.price}
                            disabled
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Pro Tier</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label htmlFor="pro-credits">Credits</Label>
                          <Input
                            id="pro-credits"
                            type="number"
                            value={pricingTiers.pro.credits}
                            onChange={(e) => setPricingTiers({
                              ...pricingTiers,
                              pro: { ...pricingTiers.pro, credits: e.target.value }
                            })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="pro-price">Price ($)</Label>
                          <Input
                            id="pro-price"
                            type="number"
                            step="0.01"
                            value={pricingTiers.pro.price}
                            onChange={(e) => setPricingTiers({
                              ...pricingTiers,
                              pro: { ...pricingTiers.pro, price: e.target.value }
                            })}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Enterprise Tier</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label htmlFor="enterprise-credits">Credits</Label>
                          <Input
                            id="enterprise-credits"
                            type="number"
                            value={pricingTiers.enterprise.credits}
                            onChange={(e) => setPricingTiers({
                              ...pricingTiers,
                              enterprise: { ...pricingTiers.enterprise, credits: e.target.value }
                            })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="enterprise-price">Price ($)</Label>
                          <Input
                            id="enterprise-price"
                            type="number"
                            step="0.01"
                            value={pricingTiers.enterprise.price}
                            onChange={(e) => setPricingTiers({
                              ...pricingTiers,
                              enterprise: { ...pricingTiers.enterprise, price: e.target.value }
                            })}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <Button onClick={handleSavePaymentSettings}>
                  Save Payment Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Mode</CardTitle>
                <CardDescription>Control site accessibility during maintenance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {maintenanceMode && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Maintenance mode is currently enabled. Regular users cannot access the site.
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenance-toggle">Enable Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      When enabled, only admins can access the site
                    </p>
                  </div>
                  <Switch
                    id="maintenance-toggle"
                    checked={maintenanceMode}
                    onCheckedChange={handleMaintenanceModeToggle}
                  />
                </div>

                <div>
                  <Label htmlFor="maintenance-message">Maintenance Message</Label>
                  <Textarea
                    id="maintenance-message"
                    value={maintenanceMessage}
                    onChange={(e) => setMaintenanceMessage(e.target.value)}
                    placeholder="We're currently performing maintenance..."
                    className="mt-2"
                  />
                  <Button onClick={handleUpdateMaintenanceMessage} className="mt-2">
                    Update Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
