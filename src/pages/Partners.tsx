import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PartnerCard } from "@/components/PartnerCard";
import { PartnerApplicationDialog } from "@/components/PartnerApplicationDialog";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Users, Plus, Building2 } from "lucide-react";
import { SmartPartnerFilter } from "@/components/SmartPartnerFilter";

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
      <header className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">{t('partners.title')}</h1>
                <p className="text-sm text-muted-foreground">
                  {t('partners.subtitle')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <Button onClick={() => setShowApplicationDialog(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  {t('partners.applyPartner')}
                </Button>
              )}
              <Button variant="outline" onClick={() => window.history.back()}>
                {t('partners.back')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Verified Partners
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{partners.length}</div>
              <p className="text-xs text-muted-foreground">
                Ready to help your business
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Service Categories
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(partners.map(p => p.category)).size}
              </div>
              <p className="text-xs text-muted-foreground">
                Different specializations
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Join Network
              </CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {user ? (
                  <Button 
                    size="sm" 
                    onClick={() => setShowApplicationDialog(true)}
                    className="w-full"
                  >
                    Apply Now
                  </Button>
                ) : (
                  <p className="text-muted-foreground">
                    Sign in to apply as a partner
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Partner Success Stories */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Success Stories</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-success mb-2">TechStart Solutions</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      "Legal Partners helped us navigate UK incorporation seamlessly. Within 3 months, 
                      we had our UK subsidiary operational and compliant."
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">Legal Services</Badge>
                      <span className="text-xs text-muted-foreground">• 3 months setup</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📈</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-800 mb-2">Manufacturing Plus</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      "Our accounting partner streamlined our UK tax compliance and saved us 40% 
                      on operational costs in the first year."
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">Accounting</Badge>
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
            <h2 className="text-xl font-semibold">Verified Partners</h2>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading partners...</div>
          ) : partners.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No verified partners yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Be the first to join our partner network and help Turkish SMEs enter the UK market
                </p>
                {user && (
                  <Button onClick={() => setShowApplicationDialog(true)} className="gap-2">
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