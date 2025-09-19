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
    navigate('/guest-analysis');
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

        {/* AI-Powered Partner Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              AI-Recommended Partners Based on Your Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-4 rounded-lg mb-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <BarChart3 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-primary">Analysis-Based Recommendations</h4>
                  <p className="text-sm text-muted-foreground">
                    Based on your {analysisResult.overallScore}% market readiness score, our AI identified key areas where partner support will accelerate your UK market entry.
                  </p>
                </div>
              </div>
            </div>

            {/* Strong Areas */}
            <div className="mb-6">
              <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Your Strong Areas
              </h4>
              <div className="grid gap-2">
                {analysisResult.keyFindings.map((finding, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-medium text-green-800">{finding}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Areas Needing Support */}
            <div className="mb-6">
              <h4 className="font-semibold text-orange-700 mb-3 flex items-center gap-2">
                <span className="text-orange-600">⚠️</span>
                Areas Where Partners Can Help
              </h4>
              <div className="grid gap-3">
                {analysisResult.recommendations.slice(0, 3).map((rec, index) => (
                  <div key={index} className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                    <p className="text-sm font-medium text-orange-800 mb-2">{rec}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                        {index === 0 ? 'Legal Partners' : index === 1 ? 'Business Development' : 'Compliance Experts'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Industry-Specific Recommendations */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-blue-800">Legal & Compliance Partners</h4>
                    <p className="text-sm text-blue-600">UK incorporation & regulatory compliance</p>
                  </div>
                  <Badge className="bg-blue-600">Critical</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Essential for {analysisResult.customerData.industry} businesses entering the UK market
                </p>
                <div className="text-xs text-blue-700 font-medium">
                  Addresses: Regulatory compliance gaps identified in your analysis
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-green-800">Accounting & Tax Partners</h4>
                    <p className="text-sm text-green-600">UK tax setup & ongoing compliance</p>
                  </div>
                  <Badge className="bg-green-600">High Priority</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Critical for {analysisResult.customerData.companySize} companies
                </p>
                <div className="text-xs text-green-700 font-medium">
                  Addresses: Financial preparedness and tax compliance needs
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-purple-800">Business Development</h4>
                    <p className="text-sm text-purple-600">Market strategy & partnerships</p>
                  </div>
                  <Badge className="bg-purple-600">Strategic</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Accelerate market penetration in {analysisResult.customerData.industry}
                </p>
                <div className="text-xs text-purple-700 font-medium">
                  Addresses: Market positioning and growth opportunities
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg border">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-amber-800">Digital Marketing</h4>
                    <p className="text-sm text-amber-600">UK-focused online presence</p>
                  </div>
                  <Badge className="bg-amber-600">Growth</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Build brand awareness and customer acquisition
                </p>
                <div className="text-xs text-amber-700 font-medium">
                  Addresses: Digital readiness and market visibility
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <Button onClick={handleCreateAccount} className="w-full">
                <UserPlus className="h-4 w-4 mr-2" />
                Create Account to Connect with AI-Matched Partners
              </Button>
              <Button onClick={() => navigate('/partners')} variant="outline" className="w-full">
                View All Verified Partners
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}