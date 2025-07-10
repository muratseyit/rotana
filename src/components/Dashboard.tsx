import { useState, useEffect } from "react";
import { BusinessForm } from "./BusinessForm";
import { AnalysisResults } from "./AnalysisResults";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Building, TrendingUp, Target, Users, Eye, RotateCcw, Brain } from "lucide-react";

interface Business {
  id: string;
  company_name: string;
  business_description: string;
  industry: string;
  company_size: string;
  website_url: string | null;
  created_at: string;
  analysis_result: any;
  overall_score: number | null;
  analysis_status: string;
  analyzed_at: string | null;
}

export function Dashboard() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    fetchBusinesses();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchBusinesses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBusinesses(data || []);
    } catch (error) {
      console.error("Error fetching businesses:", error);
      toast({
        title: "Error",
        description: "Failed to load your businesses.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    fetchBusinesses();
  };

  const reAnalyzeBusiness = async (business: Business) => {
    setIsAnalyzing(business.id);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-business', {
        body: {
          companyName: business.company_name,
          businessDescription: business.business_description,
          industry: business.industry,
          companySize: business.company_size,
          websiteUrl: business.website_url
        }
      });

      if (error) throw error;

      const { error: updateError } = await supabase
        .from('businesses')
        .update({
          analysis_result: data,
          overall_score: data.overallScore,
          analysis_status: 'completed',
          analyzed_at: new Date().toISOString()
        })
        .eq('id', business.id);

      if (updateError) throw updateError;

      toast({
        title: "Re-analysis Complete!",
        description: `Updated UK market readiness score: ${data.overallScore}%`
      });

      fetchBusinesses();
    } catch (error) {
      console.error("Error re-analyzing business:", error);
      toast({
        title: "Re-analysis Failed",
        description: "Could not re-analyze your business. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              UK Market Entry Platform
            </CardTitle>
            <CardDescription>
              Please sign in to access your dashboard and get your UK market readiness assessment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={async () => {
                try {
                  const { data, error } = await supabase.auth.signInWithOAuth({ 
                    provider: 'google',
                    options: {
                      redirectTo: window.location.origin
                    }
                  });
                  
                  if (error) {
                    console.error('Auth error:', error);
                    toast({
                      title: "Authentication Error",
                      description: error.message || "Failed to sign in with Google",
                      variant: "destructive"
                    });
                  }
                } catch (err) {
                  console.error('Sign in error:', err);
                  toast({
                    title: "Sign In Failed", 
                    description: "Please check your authentication configuration",
                    variant: "destructive"
                  });
                }
              }}
              className="w-full"
            >
              Sign In with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setShowForm(false)}
              className="mb-4"
            >
              ← Back to Dashboard
            </Button>
          </div>
          <div className="flex justify-center">
            <BusinessForm onSuccess={handleFormSuccess} />
          </div>
        </div>
      </div>
    );
  }

  // Show detailed analysis view
  if (selectedBusiness && selectedBusiness.analysis_result) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setSelectedBusiness(null)}
              className="mb-4"
            >
              ← Back to Dashboard
            </Button>
          </div>
          <AnalysisResults 
            analysis={selectedBusiness.analysis_result} 
            companyName={selectedBusiness.company_name}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">UK Market Entry Platform</h1>
                <p className="text-sm text-muted-foreground">
                  Smart soft-landing system for Turkish SMEs
                </p>
              </div>
            </div>
            <Button onClick={() => supabase.auth.signOut()}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Businesses
              </CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{businesses.length}</div>
              <p className="text-xs text-muted-foreground">
                Registered for assessment
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Assessments Ready
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {businesses.filter(b => b.analysis_status === 'completed').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Businesses analyzed
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Market Score
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                AI scoring coming soon
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Businesses Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Businesses</h2>
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Add Business
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : businesses.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No businesses yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Add your first business to get started with your UK market assessment
                </p>
                <Button onClick={() => setShowForm(true)} className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Add Your First Business
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map((business) => (
                <Card key={business.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5 text-primary" />
                        {business.company_name}
                      </CardTitle>
                      {business.overall_score && (
                        <Badge variant={business.overall_score >= 70 ? 'default' : 'secondary'}>
                          {business.overall_score}%
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      {business.industry} • {business.company_size}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                      {business.business_description}
                    </p>
                    {business.website_url && (
                      <p className="text-sm text-primary underline mb-3">
                        {business.website_url}
                      </p>
                    )}
                    
                    {/* Analysis Status */}
                    <div className="space-y-3">
                      {business.analysis_status === 'pending' && (
                        <Badge variant="outline" className="w-full justify-center">
                          Analysis Pending
                        </Badge>
                      )}
                      {business.analysis_status === 'failed' && (
                        <Badge variant="destructive" className="w-full justify-center">
                          Analysis Failed
                        </Badge>
                      )}
                      {business.analysis_status === 'completed' && business.analysis_result && (
                        <div className="space-y-2">
                          <Badge variant="default" className="w-full justify-center">
                            Analysis Complete
                          </Badge>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => setSelectedBusiness(business)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View Report
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => reAnalyzeBusiness(business)}
                              disabled={isAnalyzing === business.id}
                            >
                              {isAnalyzing === business.id ? (
                                <Brain className="h-3 w-3 animate-pulse" />
                              ) : (
                                <RotateCcw className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-muted-foreground">
                        Added {new Date(business.created_at).toLocaleDateString()}
                        {business.analyzed_at && (
                          <span className="block">
                            Analyzed {new Date(business.analyzed_at).toLocaleDateString()}
                          </span>
                        )}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}