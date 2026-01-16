import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PartnerCard } from "@/components/PartnerCard";
import { PartnerApplicationDialog } from "@/components/PartnerApplicationDialog";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Users, Plus, Building2, ArrowLeft, Star, TrendingUp, BarChart3 } from "lucide-react";
import { SmartPartnerFilter } from "@/components/SmartPartnerFilter";
import { MobileNavigation } from "@/components/MobileNavigation";
import { Link } from "react-router-dom";

interface Partner {
  id: string;
  name: string;
  description: string;
  category: string;
  specialties: string[];
  website_url: string | null;
  contact_email: string | null;
  phone: string | null;
  location: string | null;
  logo_url: string | null;
  verification_status: string;
  verified_at: string | null;
  created_at: string;
}

export default function Partners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .eq("verification_status", "verified")
        .order("verified_at", { ascending: false });

      if (error) throw error;
      setPartners(data || []);
    } catch (error) {
      console.error("Error fetching partners:", error);
      toast({
        title: t('partners.error'),
        description: t('partners.failedToLoad'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplicationSuccess = () => {
    setShowApplicationDialog(false);
    toast({
      title: t('partners.applicationSubmitted'),
      description: t('partners.applicationDesc'),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
                  <BarChart3 className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground hidden sm:block">Converta</span>
              </Link>
              <div className="h-6 w-px bg-border hidden sm:block" />
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-foreground">{t('partners.title')}</h1>
                <p className="text-xs text-muted-foreground">
                  {t('partners.subtitle')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {user && (
                <Button onClick={() => setShowApplicationDialog(true)} variant="premium" className="gap-2 hidden sm:inline-flex">
                  <Plus className="h-4 w-4" />
                  {t('partners.applyPartner')}
                </Button>
              )}
              <Button variant="outline" onClick={() => window.history.back()} size="sm" className="hidden sm:inline-flex gap-2">
                <ArrowLeft className="h-4 w-4" />
                {t('partners.back')}
              </Button>
              <MobileNavigation />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 px-4 sm:px-6 bg-gradient-to-br from-muted/50 via-background to-muted/30 overflow-hidden">
        <div className="absolute top-10 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-success/5 rounded-full blur-3xl" />
        
        <div className="mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-8">
            <Badge className="bg-primary/10 text-primary mb-4 px-4 py-1.5">
              <Building2 className="h-3.5 w-3.5 mr-1.5" />
              Verified Partner Network
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              {t('partners.title')}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Connect with verified UK-based professionals ready to help your business succeed
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <Card className="bg-card/50 backdrop-blur border-border/50 hover:shadow-md transition-all duration-300">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{partners.length}</p>
                  <p className="text-sm text-muted-foreground">{t('partners.verifiedPartners')}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 backdrop-blur border-border/50 hover:shadow-md transition-all duration-300">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {new Set(partners.map(p => p.category)).size}
                  </p>
                  <p className="text-sm text-muted-foreground">{t('partners.serviceCategories')}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 backdrop-blur border-border/50 hover:shadow-md transition-all duration-300">
              <CardContent className="p-5">
                {user ? (
                  <Button 
                    onClick={() => setShowApplicationDialog(true)}
                    variant="premium"
                    className="w-full gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    {t('partners.applyNow')}
                  </Button>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{t('partners.joinNetwork')}</p>
                      <p className="text-xs text-muted-foreground">{t('partners.signInToApply')}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        {/* Partner Success Stories */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <Star className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">{t('partners.successStories')}</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-success/5 via-success/10 to-success/5 border-success/20 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-success/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-success mb-2">TechStart Solutions</h3>
                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                      "Legal Partners helped us navigate UK incorporation seamlessly. Within 3 months, 
                      we had our UK subsidiary operational and compliant."
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="text-xs bg-success/10 text-success border-success/20">Legal Services</Badge>
                      <span className="text-xs text-muted-foreground">• 3 months setup</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📈</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-primary mb-2">Manufacturing Plus</h3>
                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                      "Our accounting partner streamlined our UK tax compliance and saved us 40% 
                      on operational costs in the first year."
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">Accounting</Badge>
                      <span className="text-xs text-muted-foreground">• 40% cost savings</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Partners Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">{t('partners.verifiedPartners')}</h2>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">{t('partners.loading')}</p>
              </div>
            </div>
          ) : partners.length === 0 ? (
            <Card className="border-dashed border-2 border-border">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">No verified partners yet</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  Be the first to join our partner network and help Turkish SMEs enter the UK market
                </p>
                {user && (
                  <Button onClick={() => setShowApplicationDialog(true)} variant="premium" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Apply as Partner
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <SmartPartnerFilter partners={partners} />
          )}
        </div>
      </main>

      <PartnerApplicationDialog
        isOpen={showApplicationDialog}
        onOpenChange={setShowApplicationDialog}
        onSuccess={handleApplicationSuccess}
      />
    </div>
  );
}
