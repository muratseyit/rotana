import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PartnerCard } from "@/components/PartnerCard";
import { PartnerApplicationDialog } from "@/components/PartnerApplicationDialog";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, Building2 } from "lucide-react";

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

  useEffect(() => {
    checkUser();
    fetchPartners();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

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
        title: "Error",
        description: "Failed to load partners.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplicationSuccess = () => {
    setShowApplicationDialog(false);
    toast({
      title: "Application Submitted!",
      description: "Your partner application has been submitted for review.",
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
                <h1 className="text-2xl font-bold">Partner Directory</h1>
                <p className="text-sm text-muted-foreground">
                  Connect with verified UK market entry partners
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <Button onClick={() => setShowApplicationDialog(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Apply as Partner
                </Button>
              )}
              <Button variant="outline" onClick={() => window.history.back()}>
                Back
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

        {/* Partners Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Verified Partners</h2>
            <div className="flex gap-2">
              {['legal', 'accounting', 'consulting', 'marketing', 'other'].map((category) => (
                <Badge key={category} variant="outline" className="capitalize">
                  {category}
                </Badge>
              ))}
            </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {partners.map((partner) => (
                <PartnerCard key={partner.id} partner={partner} />
              ))}
            </div>
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