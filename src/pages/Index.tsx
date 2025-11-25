import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { MessageSquare, Sparkles, Zap, Shield, Heart, Video, Key } from "lucide-react";
import EventBanner from "@/components/EventBanner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/chat");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/chat");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <EventBanner />
      <nav className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Stechy AI</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate("/pricing")}>
              Pricing
            </Button>
            <Button variant="ghost" onClick={() => navigate("/privacy")}>
              Privacy
            </Button>
            <Button onClick={() => navigate("/auth")}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      <main>
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Stechy AI - Your Intelligent Companion
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Experience the next generation of AI conversation with Stechy. Fast, intelligent, and always available to help with your questions, image generation, and creative tasks.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button size="lg" onClick={() => navigate("/auth")}>
                Start Chatting Free
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/pricing")}>
                View Pricing
              </Button>
              <Button size="lg" variant="secondary" onClick={() => navigate("/api-keys")}>
                <Key className="h-4 w-4 mr-2" />
                API Access
              </Button>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Get instant responses powered by the latest AI technology
              </p>
            </div>
            <div className="text-center p-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart & Accurate</h3>
              <p className="text-muted-foreground">
                Advanced AI models that understand context and nuance
              </p>
            </div>
            <div className="text-center p-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
              <p className="text-muted-foreground">
                Your conversations are encrypted and never shared
              </p>
            </div>
          </div>
        </section>

        {/* Coming Soon Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Video className="h-12 w-12 text-primary" />
                </div>
                <CardTitle className="text-3xl mb-2">Video Generation Coming Soon!</CardTitle>
                <CardDescription className="text-lg">
                  We're working on revolutionary AI-powered video creation capabilities
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Soon you'll be able to generate amazing videos from text prompts, just like you create images today with Stechy AI.
                </p>
                <Button onClick={() => navigate("/auth")} size="lg">
                  Join Waitlist
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Donation Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto">
            <Card className="border-2 border-primary/20">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Heart className="h-12 w-12 text-primary" />
                </div>
                <CardTitle className="text-3xl mb-2">Support Development</CardTitle>
                <CardDescription className="text-lg">
                  Help us make Stechy AI even better
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Your donations help us continue developing new features, improving AI models, and keeping Stechy AI accessible for everyone.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="gap-2">
                    <Heart className="h-4 w-4" />
                    Donate via PayPal
                  </Button>
                  <Button size="lg" variant="outline" className="gap-2">
                    <Heart className="h-4 w-4" />
                    Support on Patreon
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Every contribution helps us innovate and grow. Thank you for your support!
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="bg-muted py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to get started?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of users already chatting with Stechy AI
            </p>
            <Button size="lg" onClick={() => navigate("/auth")}>
              Start Free Today
            </Button>
          </div>
        </section>

        <footer className="border-t border-border py-8">
          <div className="container mx-auto px-4">
            <div className="text-center text-sm text-muted-foreground">
              <p className="mb-2">
                © {new Date().getFullYear()} Stechy AI. All rights reserved.
              </p>
              <p>
                Developed by <span className="font-semibold text-foreground">Muhammed Shafin KP</span>
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
