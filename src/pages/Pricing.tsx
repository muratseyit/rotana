import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PricingSection } from "@/components/PricingSection";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Pricing() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [currentPlan, setCurrentPlan] = useState<string>("starter");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // No user check needed anymore
  }, []);

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      toast({
        title: t('pricing.authRequired'),
        description: t('pricing.authRequiredDesc'),
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId }
      });
      
      if (error) {
        toast({
          title: t('pricing.errorTitle'),
          description: t('pricing.subscriptionError'),
          variant: "destructive",
        });
        return;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      toast({
        title: t('pricing.errorTitle'),
        description: t('pricing.subscriptionError'),
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
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) {
        toast({
          title: t('pricing.errorTitle'),
          description: t('pricing.manageError'),
          variant: "destructive",
        });
        return;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      toast({
        title: t('pricing.errorTitle'),
        description: t('pricing.manageError'),
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
                {t('pricing.backToDashboard')}
              </Button>
              <h1 className="text-xl font-semibold">{t('pricing.title')}</h1>
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
                  {t('pricing.manageSubscription')}
                </Button>
              )}
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/partners")}
                className="gap-2"
              >
                <Users className="w-4 h-4" />
                {t('pricing.partnerDirectory')}
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
              {t('pricing.customSolution')}
            </h3>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('pricing.customDesc')}
            </p>
            <Button size="lg" className="gap-2">
              <Users className="w-4 h-4" />
              {t('pricing.contactSales')}
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}