import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { IntelligentPartnerDashboard } from "@/components/IntelligentPartnerDashboard";
import { ExportReportDialog } from "@/components/ExportReportDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  FileText,
  Mail,
  Phone,
  Globe,
  MapPin,
  Landmark,
  Package,
  Clock,
  Factory
} from "lucide-react";
import {
  formatMarketSize,
  formatTradeVolume,
  getCompetitionLabel,
  getCompetitionColorClass,
  formatHSCode,
  formatTimelineRange,
  formatTariffRate
} from "@/utils/marketIntelligence";

interface MarketIntelligenceData {
  marketSizeGBP: number;
  growthRate: number;
  saturationLevel: number;
  entryOpportunity: string;
  tradeVolumeGBP: number;
  ftaBenefit: boolean;
  timelineMin: number;
  timelineMax: number;
  turkishExporterCount: number;
  suggestedHSCode?: string;
  hsCodeDescription?: string;
  tariffRate?: number;
  ftaTariffRate?: number;
  nichePotential?: string[];
  marketGaps?: string[];
}

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
    marketOpportunity?: number;
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
    matchScore?: number;
    insights?: string[];
  }>;
  metadata?: {
    dataCompleteness: {
      score: number;
      missingFields: string[];
      completedSections: string[];
    };
    analysisVersion: string;
    modelUsed: string;
    analysisDate: string;
    confidenceLevel: 'high' | 'medium' | 'low';
    companyVerification?: {
      verified: boolean;
      data?: any;
      insights?: any;
    };
    dataSourcesUsed?: string[];
    marketIntelligence?: MarketIntelligenceData;
  };
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
  const [selectedPartner, setSelectedPartner] = useState<any | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

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
        title: t('compResults.noData'),
        description: t('compResults.noDataDesc'),
        variant: "destructive"
      });
      navigate('/comprehensive-analysis-form');
      return;
    }

    setBusinessData(businessFormData);
    processComprehensiveAnalysis(businessFormData);
    
    // Clear localStorage after loading
    localStorage.removeItem('comprehensiveBusinessData');
  }, [location.state, navigate, toast, t]);

  const processComprehensiveAnalysis = async (data: BusinessData) => {
    try {
      setLoading(true);

      const { data: result, error } = await supabase.functions.invoke('analyze-business-comprehensive', {
        body: data
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
    setSelectedPartner(partner);
    setContactDialogOpen(true);
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
      {/* Partner Contact Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedPartner?.verification_status === 'verified' && (
                <CheckCircle2 className="h-5 w-5 text-success" />
              )}
              {selectedPartner?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedPartner?.category && (
                <Badge variant="secondary" className="mt-2">
                  {selectedPartner.category}
                </Badge>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {selectedPartner?.description && (
              <div>
                <h4 className="text-sm font-semibold mb-2">About</h4>
                <p className="text-sm text-muted-foreground">{selectedPartner.description}</p>
              </div>
            )}
            
            {selectedPartner?.specialties && selectedPartner.specialties.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Specialties</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedPartner.specialties.map((specialty: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-3 pt-2 border-t">
              <h4 className="text-sm font-semibold">Contact Information</h4>
              
              {selectedPartner?.contact_email && (
                <a 
                  href={`mailto:${selectedPartner.contact_email}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">{selectedPartner.contact_email}</p>
                  </div>
                </a>
              )}
              
              {selectedPartner?.phone && (
                <a 
                  href={`tel:${selectedPartner.phone}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium">{selectedPartner.phone}</p>
                  </div>
                </a>
              )}
              
              {selectedPartner?.website_url && (
                <a 
                  href={selectedPartner.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20">
                    <Globe className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Website</p>
                    <p className="text-sm font-medium">{selectedPartner.website_url}</p>
                  </div>
                </a>
              )}
              
              {selectedPartner?.location && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="text-sm font-medium">{selectedPartner.location}</p>
                  </div>
                </div>
              )}
              
              {!selectedPartner?.contact_email && !selectedPartner?.phone && !selectedPartner?.website_url && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No contact information available
                </p>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            {selectedPartner?.contact_email && (
              <Button 
                className="flex-1"
                onClick={() => {
                  window.location.href = `mailto:${selectedPartner.contact_email}`;
                  setContactDialogOpen(false);
                }}
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
            )}
            <Button 
              variant="outline"
              onClick={() => setContactDialogOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
              <ExportReportDialog
                companyName={businessData.companyName}
                overallScore={analysisResult.overallScore}
                analysis={analysisResult}
                trigger={
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export Report
                  </Button>
                }
              />
              <Button onClick={() => navigate('/')} variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        {/* Transparency & Confidence Badge */}
        {analysisResult.metadata && (
          <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <Shield className={`h-5 w-5 ${
                    analysisResult.metadata.confidenceLevel === 'high' ? 'text-green-600' :
                    analysisResult.metadata.confidenceLevel === 'medium' ? 'text-yellow-600' :
                    'text-orange-600'
                  }`} />
                  <div>
                    <p className="font-semibold text-sm">
                      Analysis Confidence: {analysisResult.metadata.confidenceLevel.toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Data Completeness: {analysisResult.metadata.dataCompleteness.score}% • 
                      Model: {analysisResult.metadata.modelUsed} • 
                      Version: {analysisResult.metadata.analysisVersion}
                    </p>
                  </div>
                </div>
                
                {analysisResult.metadata.dataCompleteness.missingFields.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {analysisResult.metadata.dataCompleteness.missingFields.length} fields incomplete
                    </Badge>
                    {analysisResult.metadata.companyVerification?.verified && (
                      <Badge variant="default" className="gap-1 bg-green-600">
                        <CheckCircle2 className="h-3 w-3" />
                        Companies House Verified
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              
              {analysisResult.metadata.dataCompleteness.completedSections.length > 0 && (
                <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground">Completed sections:</p>
                    {analysisResult.metadata.dataSourcesUsed && (
                      <p className="text-xs text-muted-foreground">
                        Data sources: {analysisResult.metadata.dataSourcesUsed.length}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {analysisResult.metadata.dataCompleteness.completedSections.map((section) => (
                      <Badge key={section} variant="secondary" className="text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {section}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

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
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-lg ${score >= 80 ? 'bg-success/10' : score >= 60 ? 'bg-yellow-100' : 'bg-destructive/10'}`}>
                    {getCategoryIcon(key)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-lg font-bold ${getScoreColor(score)}`}>{score}%</span>
                  {score >= 80 ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : score >= 60 ? (
                    <TrendingUp className="h-4 w-4 text-yellow-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  )}
                </div>
                
                <Progress value={score} className="h-1.5" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Market Intelligence Section */}
        {analysisResult.metadata?.marketIntelligence && (
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Landmark className="h-5 w-5 text-primary" />
                UK Market Intelligence
                <Badge variant="secondary" className="ml-auto">Converta Research</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Market Size */}
                <div className="p-4 rounded-lg bg-card border">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">UK Market Size</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {formatMarketSize(analysisResult.metadata.marketIntelligence.marketSizeGBP / 1000000000)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {analysisResult.metadata.marketIntelligence.growthRate}% annual growth
                  </p>
                </div>

                {/* Trade Volume */}
                <div className="p-4 rounded-lg bg-card border">
                  <div className="flex items-center gap-2 mb-2">
                    <Factory className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Turkey-UK Trade</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {formatTradeVolume(analysisResult.metadata.marketIntelligence.tradeVolumeGBP)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {analysisResult.metadata.marketIntelligence.turkishExporterCount}+ Turkish exporters
                  </p>
                </div>

                {/* Competition Level */}
                <div className="p-4 rounded-lg bg-card border">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Competition</span>
                  </div>
                  <p className={`text-2xl font-bold ${getCompetitionColorClass(getCompetitionLabel(analysisResult.metadata.marketIntelligence.saturationLevel))}`}>
                    {getCompetitionLabel(analysisResult.metadata.marketIntelligence.saturationLevel)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {analysisResult.metadata.marketIntelligence.saturationLevel}% market saturation
                  </p>
                </div>

                {/* Entry Timeline */}
                <div className="p-4 rounded-lg bg-card border">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Entry Timeline</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {formatTimelineRange(
                      analysisResult.metadata.marketIntelligence.timelineMin,
                      analysisResult.metadata.marketIntelligence.timelineMax
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Entry opportunity: {analysisResult.metadata.marketIntelligence.entryOpportunity}
                  </p>
                </div>
              </div>

              {/* HS Code & Tariff Info */}
              {(analysisResult.metadata.marketIntelligence.suggestedHSCode || 
                analysisResult.metadata.marketIntelligence.ftaBenefit) && (
                <div className="p-4 rounded-lg bg-muted/30 border">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Trade Classification & Tariffs
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysisResult.metadata.marketIntelligence.suggestedHSCode && (
                      <div>
                        <p className="text-sm text-muted-foreground">Suggested HS Code</p>
                        <p className="font-mono font-semibold">
                          {formatHSCode(analysisResult.metadata.marketIntelligence.suggestedHSCode)}
                        </p>
                        {analysisResult.metadata.marketIntelligence.hsCodeDescription && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {analysisResult.metadata.marketIntelligence.hsCodeDescription}
                          </p>
                        )}
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">Tariff Status</p>
                      {analysisResult.metadata.marketIntelligence.ftaBenefit ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            FTA Eligible
                          </Badge>
                          {(analysisResult.metadata.marketIntelligence.tariffRate !== undefined && 
                            analysisResult.metadata.marketIntelligence.ftaTariffRate !== undefined) && (
                            <span className="text-sm">
                              {formatTariffRate(
                                analysisResult.metadata.marketIntelligence.tariffRate,
                                analysisResult.metadata.marketIntelligence.ftaTariffRate
                              )}
                            </span>
                          )}
                        </div>
                      ) : (
                        <Badge variant="secondary">Standard MFN Rates Apply</Badge>
                      )}
                    </div>
                  </div>

                  {/* Market Gaps & Niche Potential */}
                  {(analysisResult.metadata.marketIntelligence.nichePotential?.length || 
                    analysisResult.metadata.marketIntelligence.marketGaps?.length) && (
                    <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysisResult.metadata.marketIntelligence.nichePotential && 
                       analysisResult.metadata.marketIntelligence.nichePotential.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Niche Opportunities</p>
                          <div className="flex flex-wrap gap-1">
                            {analysisResult.metadata.marketIntelligence.nichePotential.map((niche, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {niche}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {analysisResult.metadata.marketIntelligence.marketGaps && 
                       analysisResult.metadata.marketIntelligence.marketGaps.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Market Gaps</p>
                          <div className="flex flex-wrap gap-1">
                            {analysisResult.metadata.marketIntelligence.marketGaps.map((gap, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {gap}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs text-muted-foreground mt-4 text-center">
                Data sourced from UK trade statistics and Converta market research. Not legal or financial advice.
              </p>
            </CardContent>
          </Card>
        )}

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
        {analysisResult.recommendations && (
          <Card>
            <CardHeader>
              <CardTitle>Market Entry Roadmap</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                {analysisResult.recommendations.immediate && analysisResult.recommendations.immediate.length > 0 && (
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
                )}

                {analysisResult.recommendations.shortTerm && analysisResult.recommendations.shortTerm.length > 0 && (
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
                )}

                {analysisResult.recommendations.longTerm && analysisResult.recommendations.longTerm.length > 0 && (
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
                )}
              </div>
            </CardContent>
          </Card>
        )}

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