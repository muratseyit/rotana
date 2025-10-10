import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { IntelligentPartnerDashboard } from "@/components/IntelligentPartnerDashboard";
import { 
  BarChart3, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp,
  Target,
  Shield,
  Truck,
  Smartphone,
  Users,
  DollarSign,
  ArrowLeft,
  Download,
  FileText
} from "lucide-react";

interface ComprehensiveAnalysisResult {
  overallScore: number;
  scoreBreakdown: {
    productMarketFit: number;
    regulatoryCompatibility: number;
    digitalReadiness: number;
    logisticsPotential: number;
    scalabilityAutomation: number;
    founderTeamStrength: number;
    investmentReadiness: number;
  };
  summary: string;
  detailedInsights: Array<{
    category: string;
    score: number;
    strengths: string[];
    weaknesses: string[];
    actionItems: Array<{
      action: string;
      priority: string;
      timeframe: string;
    }>;
  }>;
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  complianceAssessment: {
    criticalRequirements: string[];
    riskAreas: string[];
    complianceScore: number;
  };
  partnerRecommendations: Array<{
    category: string;
    partners: any[];
    reason: string;
    urgency: 'high' | 'medium' | 'low';
    matchScore: number;
  }>;
}

interface BusinessData {
  companyName: string;
  businessDescription: string;
  industry: string;
  companySize: string;
  websiteUrl?: string;
  financialMetrics: any;
}

export default function ComprehensiveAnalysis() {
  const navigate = useNavigate();
  const location = useLocation();
  const [analysisResult, setAnalysisResult] = useState<ComprehensiveAnalysisResult | null>(null);
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Try to get data from location state first, then from localStorage
    let businessFormData = location.state?.businessData;
    
    if (!businessFormData) {
      const storedData = localStorage.getItem('comprehensiveBusinessData');
      if (storedData) {
        businessFormData = JSON.parse(storedData);
      }
    }
    
    if (!businessFormData) {
      toast({
        title: "No Business Data",
        description: "Please complete the comprehensive analysis form first.",
        variant: "destructive"
      });
      navigate('/comprehensive-analysis-form');
      return;
    }

    setBusinessData(businessFormData);
    processComprehensiveAnalysis(businessFormData);
    
    // Clear localStorage after loading
    localStorage.removeItem('comprehensiveBusinessData');
  }, [location.state, navigate, toast]);

  const processComprehensiveAnalysis = async (data: BusinessData) => {
    try {
      setLoading(true);

      const { data: result, error } = await supabase.functions.invoke('analyze-business', {
        body: {
          companyName: data.companyName,
          businessDescription: data.businessDescription,
          industry: data.industry,
          companySize: data.companySize,
          websiteUrl: data.websiteUrl,
          financialMetrics: data.financialMetrics,
          complianceStatus: { overallScore: 60, items: [] } // Mark as comprehensive analysis
        }
      });

      if (error) {
        console.error('Analysis error:', error);
        throw new Error('Failed to process comprehensive analysis');
      }

      setAnalysisResult(result);
    } catch (error) {
      console.error("Error processing analysis:", error);
      toast({
        title: "Analysis Failed",
        description: "Failed to process your comprehensive analysis. Please try again.",
        variant: "destructive"
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      'productMarketFit': Target,
      'regulatoryCompatibility': Shield,
      'digitalReadiness': Smartphone,
      'logisticsPotential': Truck,
      'scalabilityAutomation': TrendingUp,
      'founderTeamStrength': Users,
      'investmentReadiness': DollarSign
    };
    
    const Icon = icons[category] || BarChart3;
    return <Icon className="h-5 w-5" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-yellow-600';
    return 'text-destructive';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const handleContactPartner = (partner: any) => {
    // Handle partner contact logic
    toast({
      title: "Contact Initiated",
      description: `Connecting you with ${partner.name}...`
    });
  };

  const handleDownloadReport = () => {
    toast({
      title: "Report Generated",
      description: "Your comprehensive report is being prepared for download."
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <div className="space-y-2">
            <p className="text-lg font-medium">Processing Your Comprehensive Analysis</p>
            <p className="text-sm text-muted-foreground">This may take 30-60 seconds...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analysisResult || !businessData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">Analysis Failed</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              We couldn't process your comprehensive analysis. Please try again.
            </p>
            <Button onClick={() => navigate('/')}>Return Home</Button>
          </CardContent>
        </Card>
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
              <BarChart3 className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Comprehensive Business Analysis</h1>
                <p className="text-sm text-muted-foreground">
                  {businessData.companyName} • {businessData.industry}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleDownloadReport} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export Report
              </Button>
              <Button onClick={() => navigate('/')} variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        {/* Overall Score Header */}
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold mb-2">UK Market Readiness</h2>
                <p className="text-muted-foreground">{analysisResult.summary}</p>
              </div>
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(analysisResult.overallScore)}`}>
                  {analysisResult.overallScore}%
                </div>
                <Badge variant={getScoreBadgeVariant(analysisResult.overallScore)} className="mt-2">
                  {analysisResult.overallScore >= 80 ? 'Excellent' : 
                   analysisResult.overallScore >= 60 ? 'Good' : 'Needs Improvement'}
                </Badge>
              </div>
            </div>
            
            <Progress value={analysisResult.overallScore} className="h-3" />
          </CardContent>
        </Card>

        {/* Score Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(analysisResult.scoreBreakdown).map(([key, score]) => (
            <Card key={key}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${score >= 80 ? 'bg-success/10' : score >= 60 ? 'bg-yellow-100' : 'bg-destructive/10'}`}>
                    {getCategoryIcon(key)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}%</span>
                  {score >= 80 ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : score >= 60 ? (
                    <TrendingUp className="h-5 w-5 text-yellow-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  )}
                </div>
                
                <Progress value={score} className="h-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Insights */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Detailed Analysis</h2>
          
          <div className="space-y-4">
            {analysisResult.detailedInsights?.map((insight, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getCategoryIcon(insight.category)}
                    {insight.category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    <Badge variant={getScoreBadgeVariant(insight.score)} className="ml-auto">
                      {insight.score}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-success mb-2 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Strengths
                      </h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {insight.strengths.map((strength, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-success">•</span>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-destructive mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Areas for Improvement
                      </h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {insight.weaknesses.map((weakness, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-destructive">•</span>
                            {weakness}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {insight.actionItems && insight.actionItems.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Action Items
                      </h4>
                      <div className="space-y-2">
                        {insight.actionItems.map((action, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                            <Badge 
                              variant={action.priority === 'high' ? 'destructive' : action.priority === 'medium' ? 'secondary' : 'outline'}
                              className="text-xs"
                            >
                              {action.priority}
                            </Badge>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{action.action}</p>
                              <p className="text-xs text-muted-foreground">Timeframe: {action.timeframe}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Roadmap */}
        <Card>
          <CardHeader>
            <CardTitle>Market Entry Roadmap</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-destructive mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Immediate Actions
                </h4>
                <ul className="space-y-2">
                  {analysisResult.recommendations.immediate.map((item, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <Badge variant="destructive" className="text-xs px-1">
                        {index + 1}
                      </Badge>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-yellow-600 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Short Term (1-3 months)
                </h4>
                <ul className="space-y-2">
                  {analysisResult.recommendations.shortTerm.map((item, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <Badge variant="secondary" className="text-xs px-1">
                        {index + 1}
                      </Badge>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-success mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Long Term (3+ months)
                </h4>
                <ul className="space-y-2">
                  {analysisResult.recommendations.longTerm.map((item, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <Badge variant="outline" className="text-xs px-1 border-success text-success">
                        {index + 1}
                      </Badge>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Partner Recommendations */}
        <IntelligentPartnerDashboard
          businessAnalysis={analysisResult}
          businessData={businessData}
          onContactPartner={handleContactPartner}
          onExploreCategory={(category) => navigate('/partners', { state: { filterCategory: category } })}
        />
      </div>
    </div>
  );
}