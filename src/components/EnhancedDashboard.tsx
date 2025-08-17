import { useState, useEffect } from "react";
import { BusinessForm } from "./BusinessForm";
import { BusinessDetailsModal } from "./BusinessDetailsModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { calculateMarketabilityScore, MarketabilityResult } from "@/utils/marketabilityEngine";
import MarketabilityScoreCard from "./MarketabilityScoreCard";
import { SubscriptionStatus } from "./SubscriptionStatus";
import { PlusCircle, Building, TrendingUp, Target, Users, Eye, RotateCcw, Brain, Building2, Shield, LogOut, UserCircle, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  const [businessData, setBusinessData] = useState<any>(null);
  const [marketabilityResult, setMarketabilityResult] = useState<MarketabilityResult | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
    fetchBusinesses();
    
    // Load business data from localStorage (from onboarding)
    const storedData = localStorage.getItem('businessData');
    if (storedData) {
      const data = JSON.parse(storedData);
      setBusinessData(data);
      
      // Calculate marketability score
      const result = calculateMarketabilityScore(data);
      setMarketabilityResult(result);
    }
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
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBusinesses(data || []);
    } catch (error) {
      console.error("Error fetching businesses:", error);
      toast({
        title: "Error",
        description: "Failed to load businesses.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeBusinessLogic = async (businessId: string) => {
    setIsAnalyzing(businessId);
    try {
      const business = businesses.find(b => b.id === businessId);
      if (!business) return;

      const response = await supabase.functions.invoke("analyze-business", {
        body: {
          companyName: business.company_name,
          businessDescription: business.business_description,
          industry: business.industry,
          companySize: business.company_size,
          websiteUrl: business.website_url
        }
      });

      if (response.error) throw response.error;

      const analysisResult = response.data;

      // Update business with analysis results
      const { error: updateError } = await supabase
        .from("businesses")
        .update({
          analysis_result: analysisResult,
          overall_score: analysisResult.overallScore,
          analysis_status: "completed",
          analyzed_at: new Date().toISOString()
        })
        .eq("id", businessId);

      if (updateError) throw updateError;

      toast({
        title: "Analysis Complete",
        description: "Business analysis has been completed successfully."
      });

      fetchBusinesses();
    } catch (error) {
      console.error("Error analyzing business:", error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze business. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 75) return "default";
    if (score >= 50) return "secondary";
    return "destructive";
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleBusinessFormSubmit = () => {
    setShowForm(false);
    fetchBusinesses();
  };

  const handleUpgradeClick = () => {
    navigate('/pricing');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-slate-900">Business Bridge</span>
            </div>
            <div className="flex items-center space-x-4">
              {userRole === 'admin' && (
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/admin/partners')}
                  className="flex items-center space-x-2"
                >
                  <Shield className="h-4 w-4" />
                  <span>Admin Panel</span>
                </Button>
              )}
              <Button 
                variant="ghost" 
                onClick={() => navigate('/partners')}
                className="flex items-center space-x-2"
              >
                <Users className="h-4 w-4" />
                <span>Partners</span>
              </Button>
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <UserCircle className="h-4 w-4" />
                <span>{user?.email}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleSignOut}
                className="text-slate-600 hover:text-slate-900"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Business Dashboard</h1>
            <p className="text-slate-600 mt-2">
              Manage your business analysis and track growth opportunities
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} className="flex items-center space-x-2">
            <PlusCircle className="h-5 w-5" />
            <span>Add Business</span>
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="businesses">My Businesses</TabsTrigger>
            <TabsTrigger value="marketability">Market Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Building className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-600">Total Businesses</p>
                      <p className="text-2xl font-bold text-slate-900">{businesses.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Brain className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-600">Analyzed</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {businesses.filter(b => b.analysis_status === 'completed').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-600">Avg Score</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {businesses.length > 0 
                          ? Math.round(businesses.reduce((sum, b) => sum + (b.overall_score || 0), 0) / businesses.length)
                          : 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Target className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-600">High Potential</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {businesses.filter(b => (b.overall_score || 0) >= 75).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Subscription Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                {/* Recent Businesses */}
                <Card>
              <CardHeader>
                <CardTitle>Recent Business Analyses</CardTitle>
                <CardDescription>Your latest business analysis results</CardDescription>
              </CardHeader>
              <CardContent>
                {businesses.length === 0 ? (
                  <div className="text-center py-8">
                    <Building className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">No businesses added yet</p>
                    <Button onClick={() => setShowForm(true)} className="mt-4">
                      Add Your First Business
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {businesses.slice(0, 5).map((business) => (
                      <div key={business.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Building className="h-10 w-10 text-blue-600" />
                          <div>
                            <h3 className="font-medium text-slate-900">{business.company_name}</h3>
                            <p className="text-sm text-slate-600">{business.industry}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {business.overall_score && (
                            <Badge variant={getScoreBadgeVariant(business.overall_score)}>
                              Score: {business.overall_score}
                            </Badge>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedBusiness(business)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
              </div>
              
              {/* Subscription Status Sidebar */}
              <div className="md:col-span-1">
                <SubscriptionStatus onUpgrade={handleUpgradeClick} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="businesses" className="space-y-6">
            <div className="grid gap-6">
              {businesses.map((business) => (
                <Card key={business.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Building className="h-12 w-12 text-blue-600" />
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{business.company_name}</h3>
                          <p className="text-slate-600">{business.industry} • {business.company_size}</p>
                          <p className="text-sm text-slate-500 mt-1">{business.business_description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {business.overall_score ? (
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${getScoreColor(business.overall_score)}`}>
                              {business.overall_score}
                            </div>
                            <div className="text-xs text-slate-500">Score</div>
                          </div>
                        ) : (
                          <Badge variant="outline">Not Analyzed</Badge>
                        )}
                        <div className="flex flex-col space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedBusiness(business)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          {(!business.analysis_result || business.analysis_status === 'pending') && (
                            <Button
                              size="sm"
                              onClick={() => analyzeBusinessLogic(business.id)}
                              disabled={isAnalyzing === business.id}
                            >
                              {isAnalyzing === business.id ? (
                                <>
                                  <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                                  Analyzing...
                                </>
                              ) : (
                                <>
                                  <Brain className="h-4 w-4 mr-2" />
                                  Analyze
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="marketability" className="space-y-6">
            {marketabilityResult && businessData ? (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Market Readiness Analysis</h2>
                  <p className="text-slate-600">
                    Based on your onboarding data for {businessData.companyName}
                  </p>
                </div>
                <MarketabilityScoreCard result={marketabilityResult} />
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Target className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No Market Analysis Available</h3>
                  <p className="text-slate-600 mb-4">
                    Complete the onboarding process to get your personalized market readiness analysis.
                  </p>
                  <Button onClick={() => navigate('/onboarding')}>
                    Start Onboarding
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <BusinessForm onSuccess={handleBusinessFormSubmit} />
            <Button 
              variant="outline" 
              onClick={() => setShowForm(false)}
              className="mt-4"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {selectedBusiness && (
        <BusinessDetailsModal 
          business={selectedBusiness}
          isOpen={!!selectedBusiness}
          onOpenChange={(open) => !open && setSelectedBusiness(null)}
          onUpdate={fetchBusinesses}
        />
      )}
    </div>
  );
}