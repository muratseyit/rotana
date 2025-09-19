import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Download, UserPlus, BarChart3, FileText, Users } from "lucide-react";

interface GuestAnalysisResult {
  overallScore: number;
  summary: string;
  keyFindings: string[];
  recommendations: string[];
  riskFactors: string[];
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
      // Simulate analysis processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create analysis result using the submitted data
      const mockResult: GuestAnalysisResult = {
        overallScore: Math.floor(Math.random() * 30) + 60, // Random score between 60-90
        summary: `Your ${analysisData.industry} business shows strong potential for UK market entry with good fundamentals in place.`,
        keyFindings: [
          "Strong market demand in your industry sector",
          "Good scalability potential identified",
          "Competitive advantage in digital readiness"
        ],
        recommendations: [
          "Develop UK-specific compliance framework",
          "Establish local partnerships for market entry",
          "Consider regulatory requirements for your industry"
        ],
        riskFactors: [
          "Currency fluctuation exposure", 
          "Regulatory compliance gaps",
          "Market saturation concerns"
        ],
        customerData: {
          companyName: analysisData.companyName,
          email: analysisData.email,
          industry: analysisData.industry,
          companySize: analysisData.companySize
        }
      };

      setAnalysisResult(mockResult);
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
    navigate('/auth?mode=signup&from=guest-analysis');
  };

  const handleDownloadReport = () => {
    toast({
      title: "Download Started",
      description: "Your analysis report is being prepared for download."
    });
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

        {/* Analysis Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>UK Market Readiness Score</span>
              <Badge variant="secondary" className="text-2xl px-4 py-2">
                {analysisResult.overallScore}%
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{analysisResult.summary}</p>
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

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
          <CardHeader>
            <CardTitle className="text-white">Ready to Take the Next Step?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-100 mb-4">
              Create an account to save your results, access our partner directory, and get personalized recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleCreateAccount}
                className="bg-white text-blue-600 hover:bg-slate-100"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Create Account & Access Partners
              </Button>
              <Button 
                onClick={handleDownloadReport}
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Relevant Partners Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Recommended Partners for Your Industry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Based on your {analysisResult.customerData.industry} business analysis, these partners can help you enter the UK market:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-blue-800">Legal & Compliance Partners</h4>
                    <p className="text-sm text-blue-600">UK incorporation & regulatory compliance</p>
                  </div>
                  <Badge className="bg-blue-600">Recommended</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Essential for {analysisResult.customerData.industry} businesses entering the UK market
                </p>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-green-800">Accounting & Tax Partners</h4>
                    <p className="text-sm text-green-600">UK tax setup & ongoing compliance</p>
                  </div>
                  <Badge className="bg-green-600">High Priority</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Critical for {analysisResult.customerData.companySize} companies
                </p>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <Button onClick={handleCreateAccount} className="w-full">
                <UserPlus className="h-4 w-4 mr-2" />
                Create Account to Connect with Partners
              </Button>
              <Button onClick={() => navigate('/partners')} variant="outline" className="w-full">
                View All Partners
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}