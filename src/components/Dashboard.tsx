import { useState, useEffect } from "react";
import { BusinessForm } from "./BusinessForm";
import { BusinessDetailsModal } from "./BusinessDetailsModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  PlusCircle, 
  Building, 
  TrendingUp, 
  Target, 
  Users, 
  Eye, 
  RotateCcw, 
  Brain, 
  Building2, 
  Shield,
  CheckCircle,
  AlertCircle,
  Globe
} from "lucide-react";

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
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    fetchBusinesses();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    if (user) {
      // Check if user has admin role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();
      
      setUserRole(roleData?.role || null);
    }
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
      
      // Show welcome message for new users
      if ((data || []).length === 0 && !localStorage.getItem('welcomeShown')) {
        setShowWelcome(true);
        localStorage.setItem('welcomeShown', 'true');
      }
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
    return null; // Let the routing handle authentication
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


  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Header */}
      <header className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">Business Bridge</h1>
                <p className="text-sm text-muted-foreground">
                  AI-Powered UK Market Entry for Turkish SMEs
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => window.open('/partners', '_blank')}
                className="gap-2 hover:bg-primary/10"
              >
                <Building2 className="h-4 w-4" />
                Partner Directory
              </Button>
              {userRole === 'admin' && (
                <Button 
                  variant="outline" 
                  onClick={() => window.open('/admin/partners', '_blank')}
                  className="gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Admin Partners
                </Button>
              )}
              <Button onClick={() => supabase.auth.signOut()} variant="ghost">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Welcome Message */}
      {showWelcome && (
        <div className="bg-gradient-primary/10 border-b border-primary/20">
          <div className="mx-auto max-w-7xl px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/20">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-primary">Welcome to Business Bridge!</h2>
                  <p className="text-muted-foreground mt-1">
                    Start by adding your first business to get a comprehensive UK market readiness assessment powered by AI.
                  </p>
                </div>
              </div>
              <Button onClick={() => setShowWelcome(false)} variant="ghost" size="sm">
                ×
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 border-l-primary bg-gradient-to-r from-card to-primary/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Businesses
              </CardTitle>
              <div className="p-2 rounded-full bg-primary/20">
                <Building className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{businesses.length}</div>
              <p className="text-xs text-muted-foreground">
                Registered for assessment
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-secondary bg-gradient-to-r from-card to-secondary/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Assessments Complete
              </CardTitle>
              <div className="p-2 rounded-full bg-secondary/20">
                <TrendingUp className="h-4 w-4 text-secondary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">
                {businesses.filter(b => b.analysis_status === 'completed').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Ready for review
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-accent bg-gradient-to-r from-card to-accent/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Score
              </CardTitle>
              <div className="p-2 rounded-full bg-accent/20">
                <Target className="h-4 w-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">
                {businesses.length > 0 
                  ? Math.round(businesses.filter(b => b.overall_score).reduce((acc, b) => acc + (b.overall_score || 0), 0) / businesses.filter(b => b.overall_score).length) || '--'
                  : '--'
                }%
              </div>
              <p className="text-xs text-muted-foreground">
                Market readiness
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
            <Card className="bg-gradient-to-br from-card to-primary/5 border-primary/20">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="p-4 rounded-full bg-gradient-primary/20 mb-6">
                  <Building className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-primary">Ready to explore the UK market?</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  Add your first business to get a comprehensive AI-powered assessment of your UK market readiness. 
                  Our analysis covers market fit, regulatory compliance, digital readiness, and more.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={() => setShowForm(true)} className="gap-2 px-6">
                    <PlusCircle className="h-4 w-4" />
                    Add Your First Business
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.open('/partners', '_blank')}
                    className="gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Browse Partners
                  </Button>
                </div>
                <div className="flex items-center gap-6 mt-8 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" />
                    AI-Powered Analysis
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    Compliance Checking
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Market Insights
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {businesses.map((business) => (
                <Card key={business.id} className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-card/50 border-l-4 border-l-primary/20 hover:border-l-primary">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2 text-lg group-hover:text-primary transition-colors">
                          <div className="p-1.5 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <Building className="h-4 w-4 text-primary" />
                          </div>
                          <span className="truncate">{business.company_name}</span>
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {business.industry} • {business.company_size}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {business.overall_score && (
                          <Badge 
                            variant={business.overall_score >= 80 ? 'default' : business.overall_score >= 60 ? 'secondary' : 'destructive'}
                            className="font-bold"
                          >
                            {business.overall_score}%
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {business.business_description}
                    </p>
                    {business.website_url && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="h-3 w-3 text-primary" />
                        <a 
                          href={business.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline truncate"
                        >
                          {business.website_url}
                        </a>
                      </div>
                    )}
                    
                    {/* Analysis Status */}
                    <div className="space-y-3 pt-2 border-t">
                      {business.analysis_status === 'pending' && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-center">
                            <Badge variant="outline" className="animate-pulse bg-yellow-50 border-yellow-200 text-yellow-700">
                              <Brain className="h-3 w-3 mr-1 animate-pulse" />
                              Analysis Pending
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            className="w-full gap-2"
                            onClick={() => reAnalyzeBusiness(business)}
                            disabled={isAnalyzing === business.id}
                          >
                            {isAnalyzing === business.id ? (
                              <>
                                <Brain className="h-3 w-3 animate-spin" />
                                Analyzing…
                              </>
                            ) : (
                              <>
                                <RotateCcw className="h-3 w-3" />
                                Start Analysis
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                      {business.analysis_status === 'failed' && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-center">
                            <Badge variant="destructive" className="bg-red-50 border-red-200 text-red-700">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Analysis Failed
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="w-full gap-2"
                            onClick={() => reAnalyzeBusiness(business)}
                            disabled={isAnalyzing === business.id}
                          >
                            {isAnalyzing === business.id ? (
                              <>
                                <Brain className="h-3 w-3 animate-spin" />
                                Retrying…
                              </>
                            ) : (
                              <>
                                <RotateCcw className="h-3 w-3" />
                                Retry Analysis
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                      {business.analysis_status === 'completed' && business.analysis_result && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-center">
                            <Badge className="bg-green-50 border-green-200 text-green-700">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Analysis Complete
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="flex-1 gap-2"
                              onClick={() => setSelectedBusiness(business)}
                            >
                              <Eye className="h-3 w-3" />
                              View Report
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => reAnalyzeBusiness(business)}
                              disabled={isAnalyzing === business.id}
                              className="px-3"
                            >
                              {isAnalyzing === business.id ? (
                                <Brain className="h-3 w-3 animate-spin" />
                              ) : (
                                <RotateCcw className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Added {new Date(business.created_at).toLocaleDateString()}</span>
                        {business.analyzed_at && (
                          <span className="text-primary">
                            Analyzed {new Date(business.analyzed_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <BusinessDetailsModal
        business={selectedBusiness}
        isOpen={!!selectedBusiness}
        onOpenChange={(open) => !open && setSelectedBusiness(null)}
        onUpdate={fetchBusinesses}
      />
    </div>
  );
}