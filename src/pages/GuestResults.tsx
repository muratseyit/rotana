import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import { PricingSection } from "@/components/PricingSection";
import { SaveReportDialog } from "@/components/SaveReportDialog";
import { CheckCircle, Download, UserPlus, BarChart3, FileText, Users, Crown, AlertTriangle } from "lucide-react";

interface GuestAnalysisResult {
  overallScore: number;
  summary: string;
  keyFindings: string[];
  recommendations: string[];
  riskFactors: string[];
  limitedAnalysis?: boolean;
  upgradePrompt?: string;
  nextSteps?: string[];
  customerData: {
    companyName: string;
    email: string;
    industry: string;
    companySize: string;
  };
}

export default function GuestResults() {
  const navigate = useNavigate();
  const [analysisResult, setAnalysisResult] = useState<GuestAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPricing, setShowPricing] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedData = localStorage.getItem('guestAnalysisData');
    
    if (!storedData) {
      toast({
        title: "No Analysis Data",
        description: "Please complete the analysis form first.",
        variant: "destructive"
      });
      navigate('/guest-analysis');
      return;
    }

    processAnalysis(JSON.parse(storedData));
  }, []);

  const processAnalysis = async (analysisData: any) => {
    try {
      // Call the analyze-business edge function for guest analysis
      const { data, error } = await supabase.functions.invoke('analyze-business', {
        body: {
          companyName: analysisData.companyName,
          businessDescription: analysisData.businessDescription,
          industry: analysisData.industry,
          companySize: analysisData.companySize,
          websiteUrl: analysisData.websiteUrl,
          // No financial metrics or compliance status = guest analysis
        }
      });

      if (error) {
        console.error('Analysis error:', error);
        throw new Error('Failed to process analysis');
      }

      setAnalysisResult({
        ...data,
        customerData: {
          companyName: analysisData.companyName,
          email: analysisData.email,
          industry: analysisData.industry,
          companySize: analysisData.companySize
        }
      });

      // Clear the stored data after processing
      localStorage.removeItem('guestAnalysisData');
    } catch (error) {
      console.error("Error processing analysis:", error);
      toast({
        title: "Processing Error",
        description: "Failed to process your analysis. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = () => {
    navigate('/guest-analysis');
  };

  const handleDownloadReport = () => {
    setShowSaveDialog(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Generating your business analysis...</p>
        </div>
      </div>
    );
  }

  if (!analysisResult) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">Analysis Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              We couldn't find your analysis results. Please contact support.
            </p>
            <Button onClick={() => navigate('/')}>Return Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-slate-900">Business Bridge</span>
            </div>
            <Button onClick={() => navigate('/')} variant="ghost">
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Success Banner */}
        <Card className="border-success bg-success/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-success" />
              <div>
                <h2 className="text-xl font-semibold text-success">Analysis Complete!</h2>
                <p className="text-muted-foreground">Your AI business analysis results are ready.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Score with Upgrade Notice */}
        <Card className={analysisResult.limitedAnalysis ? "border-orange-200 bg-orange-50/30" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>UK Market Readiness Score</span>
                {analysisResult.limitedAnalysis && (
                  <Badge variant="outline" className="text-xs border-orange-400 text-orange-700">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Limited Analysis
                  </Badge>
                )}
              </div>
              <Badge variant="secondary" className="text-2xl px-4 py-2">
                {analysisResult.overallScore}%
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-3">{analysisResult.summary}</p>
            {analysisResult.limitedAnalysis && (
              <div className="p-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
                <p className="text-sm text-primary font-medium mb-1">🚀 Upgrade for Complete Analysis</p>
                <p className="text-xs text-muted-foreground">{analysisResult.upgradePrompt}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Key Findings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-success" />
                Key Findings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysisResult.keyFindings.map((finding, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    {finding}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysisResult.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    • {rec}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Risk Factors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-orange-600">⚠️</span>
                Risk Factors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysisResult.riskFactors.map((risk, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    • {risk}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Comprehensive Analysis Upgrade */}
        {analysisResult.limitedAnalysis && (
          <SubscriptionGate
            title="Complete Business Analysis"
            description="Unlock your full 7-category market readiness assessment with detailed scoring, compliance checklist, and step-by-step roadmap."
            feature="comprehensive-analysis"
            currentAnalysis={{
              overallScore: analysisResult.overallScore,
              industry: analysisResult.customerData.industry,
              companyName: analysisResult.customerData.companyName
            }}
            onUpgrade={() => setShowPricing(true)}
          />
        )}

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              {analysisResult.limitedAnalysis ? (
                <>
                  <Crown className="h-5 w-5" />
                  Unlock Your Full Business Potential
                </>
              ) : (
                "Ready to Take the Next Step?"
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-100 mb-4">
              {analysisResult.limitedAnalysis 
                ? "Get the complete analysis with AI-matched partners, detailed compliance assessment, and professional reports."
                : "Create an account to save your results, access our partner directory, and get personalized recommendations."
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => setShowPricing(true)}
                className="bg-white text-blue-600 hover:bg-slate-100"
              >
                {analysisResult.limitedAnalysis ? (
                  <>
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Premium
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Account & Access Partners
                  </>
                )}
              </Button>
              <Button 
                onClick={handleDownloadReport}
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                <Download className="h-4 w-4 mr-2" />
                {analysisResult.limitedAnalysis ? "Download Summary" : "Download Report"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI-Powered Partner Recommendations - Subscription Gate */}
        <SubscriptionGate
          title="AI-Matched Partner Recommendations"
          description="Get personalized partner matches based on your business analysis and identified improvement areas."
          feature="partner-recommendations"
          currentAnalysis={{
            overallScore: analysisResult.overallScore,
            industry: analysisResult.customerData.industry,
            companyName: analysisResult.customerData.companyName
          }}
          onUpgrade={() => setShowPricing(true)}
        />

        {showPricing && (
          <Card>
            <CardHeader>
              <CardTitle>Unlock Premium Features</CardTitle>
            </CardHeader>
            <CardContent>
              <PricingSection />
            </CardContent>
          </Card>
        )}

        {/* Save Report Dialog */}
        <SaveReportDialog
          isOpen={showSaveDialog}
          onOpenChange={setShowSaveDialog}
          analysisResult={analysisResult}
          businessData={analysisResult.customerData}
        />
      </div>
    </div>
  );
}