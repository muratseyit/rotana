import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PricingSection } from "@/components/PricingSection";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, Users, BarChart3, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { MobileNavigation } from "@/components/MobileNavigation";
import { Badge } from "@/components/ui/badge";
import { FadeUp, FadeIn, ScaleUp } from "@/components/ScrollAnimations";

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
      <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
                  <BarChart3 className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground hidden sm:block">Converta</span>
              </Link>
              <div className="h-6 w-px bg-border hidden sm:block" />
              <h1 className="text-lg font-semibold text-foreground hidden sm:block">{t('pricing.title')}</h1>
            </div>
            
            <div className="flex items-center gap-2">
              {user && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleManageSubscription}
                  disabled={isLoading}
                  className="gap-2 hidden sm:inline-flex"
                >
                  <CreditCard className="w-4 h-4" />
                  {t('pricing.manageSubscription')}
                </Button>
              )}
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/partners")}
                className="gap-2 hidden sm:inline-flex"
              >
                <Users className="w-4 h-4" />
                {t('pricing.partnerDirectory')}
              </Button>
              <MobileNavigation />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 px-4 bg-gradient-to-br from-muted/50 via-background to-muted/30 overflow-hidden">
        <div className="absolute top-10 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-success/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <FadeUp>
            <Badge className="bg-primary/10 text-primary mb-4 px-4 py-1.5">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Simple & Transparent
            </Badge>
          </FadeUp>
          <FadeUp delay={0.1}>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              {t('pricing.title')}
            </h1>
          </FadeUp>
          <FadeUp delay={0.2}>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Two pathways to UK market success - affordable analysis for SMEs and valuable listings for service partners
            </p>
          </FadeUp>
        </div>
      </section>

      {/* Main Content */}
      <main>
        <ScaleUp>
          <PricingSection 
            onSubscribe={handleSubscribe}
            currentPlan={currentPlan}
          />
        </ScaleUp>

        {/* Enterprise Contact Section */}
        <section className="py-16 bg-gradient-to-br from-primary via-primary to-primary/90">
          <div className="container mx-auto max-w-4xl px-4 text-center">
            <FadeUp>
              <h3 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
                {t('pricing.customSolution')}
              </h3>
            </FadeUp>
            <FadeUp delay={0.1}>
              <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                {t('pricing.customDesc')}
              </p>
            </FadeUp>
            <FadeUp delay={0.2}>
              <Button size="lg" className="gap-2 bg-background text-foreground hover:bg-background/90 shadow-lg">
                <Users className="w-4 h-4" />
                {t('pricing.contactSales')}
              </Button>
            </FadeUp>
          </div>
        </section>
      </main>
    </div>
  );
}
