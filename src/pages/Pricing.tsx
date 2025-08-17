import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PricingSection } from "@/components/PricingSection";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Pricing() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [currentPlan, setCurrentPlan] = useState<string>("starter");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    if (user) {
      // TODO: Check user's current subscription plan
      // This would typically involve calling a check-subscription edge function
    }
  };

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe to a plan.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement Stripe checkout
      // const { data, error } = await supabase.functions.invoke('create-checkout', {
      //   body: { priceId }
      // });
      
      toast({
        title: "Coming Soon",
        description: "Subscription functionality will be available soon!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // TODO: Implement customer portal
      // const { data, error } = await supabase.functions.invoke('customer-portal');
      
      toast({
        title: "Coming Soon",
        description: "Subscription management will be available soon!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open subscription management. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/")}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <h1 className="text-xl font-semibold">Pricing Plans</h1>
            </div>
            
            <div className="flex items-center gap-2">
              {user && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleManageSubscription}
                  disabled={isLoading}
                  className="gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  Manage Subscription
                </Button>
              )}
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/partners")}
                className="gap-2"
              >
                <Users className="w-4 h-4" />
                Partner Directory
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <PricingSection 
          onSubscribe={handleSubscribe}
          currentPlan={currentPlan}
        />

        {/* Enterprise Contact Section */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto max-w-4xl px-4 text-center">
            <h3 className="text-2xl font-bold mb-4">
              Need a Custom Solution?
            </h3>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              If you're a large organization or need custom features, 
              we'd love to discuss a tailored solution for your needs.
            </p>
            <Button size="lg" className="gap-2">
              <Users className="w-4 h-4" />
              Contact Sales
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}