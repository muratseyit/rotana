import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import { PricingSection } from "@/components/PricingSection";
import { SaveReportDialog } from "@/components/SaveReportDialog";
import { CheckCircle, Download, UserPlus, BarChart3, FileText, Users, Crown, AlertTriangle, TrendingUp, Zap, Lock, ArrowRight, ClipboardList, Ship, Package } from "lucide-react";
import { trackEvent, trackFunnel, trackTimeOnPage, trackScrollDepth } from "@/utils/analytics";

interface GuestAnalysisResult {
  overallScore: number;
  categoryScores?: {
    marketFit: number;
    businessModel: number;
    digitalReadiness: number;
  };
  industryComparison?: {
    industry: string;
    averageUKScore: number;
    yourPosition: string;
    scoreGap: number;
    percentile?: number;
  };
  summary: string;
  keyInsight?: string;
  keyFindings: string[];
  recommendations: string[];
  riskFactors: string[];
  limitedAnalysis?: boolean;
  upgradeMessage?: string;
  urgencyLevel?: 'high' | 'medium' | 'low';
  websiteInsights?: {
    hasWebsite: boolean;
    digitalScore: number;
    strengths?: string[];
    improvements?: string[];
    criticalIssue?: string;
  };
  missingInsights?: string[];
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
  const { t } = useLanguage();

  useEffect(() => {
    // Track page view and engagement
    trackFunnel('results_view');
    const trackTime = trackTimeOnPage('guest-results');
    const trackScroll = trackScrollDepth('guest-results');

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

    // Cleanup tracking on unmount
    return () => {
      trackTime();
      trackScroll();
    };
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

      // Send analysis email nurture sequence
      try {
        await supabase.functions.invoke('send-analysis-email', {
          body: {
            email: analysisData.email,
            companyName: analysisData.companyName,
            overallScore: data.overallScore || 0,
            topChallenge: data.challenges?.[0] || 'Market entry complexity',
            upgradeUrl: `${window.location.origin}/comprehensive-analysis-form?ref=email`,
            industry: analysisData.industry,
          }
        });
        console.log('Analysis email sent successfully');
      } catch (emailError) {
        // Don't block the user experience if email fails
        console.warn('Failed to send analysis email:', emailError);
      }

      setAnalysisResult({
        overallScore: data.overallScore || 0,
        categoryScores: data.categoryScores,
        industryComparison: data.industryComparison,
        summary: data.summary || data.riskAssessment || "Analysis completed",
        keyInsight: data.keyInsight,
        keyFindings: data.strengths || [],
        recommendations: data.priorityActions || [],
        riskFactors: data.challenges || [],
        limitedAnalysis: true,
        upgradeMessage: data.upgradeMessage,
        urgencyLevel: data.urgencyLevel,
        websiteInsights: data.websiteInsights,
        missingInsights: data.missingInsights,
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
          <p className="text-muted-foreground">{t('results.generating')}</p>
        </div>
      </div>
    );
  }

  if (!analysisResult) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">{t('results.notFound')}</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              {t('results.notFoundDesc')}
            </p>
            <Button onClick={() => navigate('/')}>{t('results.returnHome')}</Button>
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
              <span className="text-2xl font-bold text-slate-900">Converta</span>
            </div>
            <Button onClick={() => navigate('/')} variant="ghost">
              {t('analysis.page.backHome')}
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
                <h2 className="text-xl font-semibold text-success">{t('results.complete')}</h2>
                <p className="text-muted-foreground">{t('results.ready')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Score */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Your UK Market Readiness Score
            </CardTitle>
            <CardDescription>Quick analysis snapshot</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-primary">
                  {analysisResult.overallScore}%
                </span>
                <Badge variant="outline" className="text-xs border-orange-400 text-orange-700">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Limited Analysis
                </Badge>
              </div>
              <Progress value={analysisResult.overallScore} className="h-3" />
              <p className="text-sm text-muted-foreground">{analysisResult.summary}</p>
            </div>
          </CardContent>
        </Card>

        {/* Industry Comparison */}
        {analysisResult.industryComparison && (
          <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              Industry Benchmark Comparison
            </CardTitle>
            <CardDescription>
              {analysisResult.industryComparison.industry} sector average in UK market
            </CardDescription>
              <CardDescription>UK market entry readiness benchmark</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Your Score</span>
                    <span className="text-2xl font-bold text-orange-600">{analysisResult.overallScore}%</span>
                  </div>
                  <Progress value={analysisResult.overallScore} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Industry Average (UK)</span>
                    <span className="text-2xl font-bold text-blue-600">{analysisResult.industryComparison.averageUKScore}%</span>
                  </div>
                  <Progress value={analysisResult.industryComparison.averageUKScore} className="h-3" />
                </div>
                <div className={`p-4 rounded-lg ${analysisResult.industryComparison.scoreGap < 0 ? 'bg-orange-100 border border-orange-200' : 'bg-green-100 border border-green-200'}`}>
                  <div className="flex items-start gap-2">
                    {analysisResult.industryComparison.scoreGap < 0 ? (
                      <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-semibold text-sm mb-1">
                        {analysisResult.industryComparison.yourPosition}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {analysisResult.industryComparison.scoreGap < 0 ? (
                          <>You're <strong>{Math.abs(analysisResult.industryComparison.scoreGap)} points below</strong> the average for {analysisResult.customerData.industry} businesses entering the UK market.</>
                        ) : (
                          <>You're <strong>{analysisResult.industryComparison.scoreGap} points above</strong> the average for {analysisResult.customerData.industry} businesses entering the UK market.</>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* UK Trade Requirements - Essential Info */}
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ship className="h-5 w-5 text-blue-600" />
              Essential UK Trade Requirements
            </CardTitle>
            <CardDescription>
              Key requirements for exporting goods to the UK market
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* EORI Number */}
            <div className="p-4 bg-white rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm">EORI Number</p>
                    <Badge variant="destructive" className="text-xs">Required</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Economic Operator Registration and Identification – mandatory for all customs declarations when importing/exporting to/from the UK.
                  </p>
                  <p className="text-xs text-blue-700 font-medium">
                    ⏱ Processing time: 1-3 business days • 💰 Cost: Free
                  </p>
                </div>
              </div>
            </div>

            {/* HS Codes */}
            <div className="p-4 bg-white rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ClipboardList className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm">HS Code Classification</p>
                    <Badge variant="destructive" className="text-xs">Required</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Harmonized System codes determine duty rates and required documentation. Incorrect classification can result in delays and penalties.
                  </p>
                  <p className="text-xs text-indigo-700 font-medium">
                    📋 Use UK Trade Tariff tool for classification
                  </p>
                </div>
              </div>
            </div>

            {/* VAT Threshold */}
            <div className="p-4 bg-white rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">💷</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm">UK VAT Registration</p>
                    <Badge variant="outline" className="text-xs border-orange-400 text-orange-700">Conditional</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Required if UK taxable turnover exceeds £90,000 (2025 threshold) or if you store goods in the UK.
                  </p>
                  <p className="text-xs text-green-700 font-medium">
                    📊 Threshold: £90,000 • 💰 Registration: Free
                  </p>
                </div>
              </div>
            </div>

            {/* Upsell to full compliance checklist */}
            <div className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border-2 border-primary/30">
              <div className="flex items-start gap-3">
                <Lock className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-sm mb-1">Unlock Full Compliance Checklist</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Get 40+ industry-specific requirements including UKCA marking, customs documentation, UK Responsible Person, origin certificates, and more.
                  </p>
                  <ul className="text-xs space-y-1 mb-3">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-primary" />
                      <span>CDS Customs Declarations setup</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-primary" />
                      <span>UKCA/CE marking requirements for your products</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-primary" />
                      <span>UK Responsible Person obligations</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-primary" />
                      <span>Incoterms & origin documentation</span>
                    </li>
                  </ul>
                  <Button 
                    size="sm"
                    onClick={() => {
                      trackFunnel('upgrade_click', { location: 'trade_requirements_upsell' });
                      trackEvent('upgrade_clicked', { source: 'trade_requirements', score: analysisResult?.overallScore });
                      navigate('/comprehensive-analysis-form');
                    }}
                  >
                    <ClipboardList className="h-4 w-4 mr-2" />
                    Get Full Compliance Checklist
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Market Intelligence Teaser - Quick Analysis */}
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Market Intelligence Preview
            </CardTitle>
            <CardDescription>
              Data-driven insights for {analysisResult.customerData.industry || 'your industry'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded-lg border text-center">
                <p className="text-xs text-muted-foreground">UK Market Size</p>
                <p className="text-lg font-bold text-purple-600">£100B+</p>
              </div>
              <div className="p-3 bg-white rounded-lg border text-center">
                <p className="text-xs text-muted-foreground">Competition</p>
                <p className="text-lg font-bold text-yellow-600">Medium</p>
              </div>
              <div className="p-3 bg-white rounded-lg border text-center">
                <p className="text-xs text-muted-foreground">FTA Benefit</p>
                <p className="text-lg font-bold text-green-600">Yes</p>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border-2 border-primary/30">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-sm mb-1">Unlock Full Market Intelligence</p>
                  <ul className="text-xs space-y-1 mb-3 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-primary" />
                      <span>Precise market size & growth data</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-primary" />
                      <span>Turkey-UK trade flow analysis</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-primary" />
                      <span>HS Code classification & tariff rates</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-primary" />
                      <span>Market entry timeline estimation</span>
                    </li>
                  </ul>
                  <Button 
                    size="sm"
                    onClick={() => {
                      trackFunnel('upgrade_click', { location: 'market_intelligence_teaser' });
                      trackEvent('upgrade_clicked', { source: 'market_intel', score: analysisResult?.overallScore });
                      navigate('/comprehensive-analysis-form');
                    }}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Get Market Intelligence Report
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Key Findings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-success" />
                {t('results.keyFindings')}
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                {t('results.recommendations')}
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-orange-600">⚠️</span>
                {t('results.riskFactors')}
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

        {/* Website Insights Card */}
        {analysisResult.websiteInsights && (
          <Card className={analysisResult.websiteInsights.hasWebsite ? "border-blue-200 bg-blue-50/50" : "border-red-200 bg-red-50/50"}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className={`h-5 w-5 ${analysisResult.websiteInsights.hasWebsite ? 'text-blue-600' : 'text-red-600'}`} />
                Digital Presence Analysis
              </CardTitle>
              <CardDescription>
                {analysisResult.websiteInsights.hasWebsite 
                  ? `Digital Readiness Score: ${analysisResult.websiteInsights.digitalScore}/100`
                  : 'Critical Issue Detected'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysisResult.websiteInsights.hasWebsite ? (
                <>
                  {analysisResult.websiteInsights.strengths && analysisResult.websiteInsights.strengths.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2 text-green-700">✓ Website Strengths:</p>
                      <ul className="space-y-1">
                        {analysisResult.websiteInsights.strengths.map((strength: string, idx: number) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysisResult.websiteInsights.improvements && analysisResult.websiteInsights.improvements.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2 text-orange-700">⚠ Recommended Improvements:</p>
                      <ul className="space-y-1">
                        {analysisResult.websiteInsights.improvements.map((improvement: string, idx: number) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                            {improvement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-4 bg-white rounded-lg border-2 border-red-200">
                  <p className="text-sm font-medium text-red-700 mb-2">
                    <AlertTriangle className="inline h-4 w-4 mr-1" />
                    {analysisResult.websiteInsights.criticalIssue}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    A professional website is crucial for UK market credibility. 87% of UK businesses research online before partnerships.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Missing Analysis Teasers */}
        <Card className="relative overflow-hidden border-2 border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background/95 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <div className="text-center p-6">
              <Lock className="h-12 w-12 text-primary mx-auto mb-3" />
              <p className="font-semibold text-lg mb-2">Unlock with Comprehensive Analysis</p>
              <Button 
                onClick={() => {
                  trackFunnel('upgrade_click', { location: 'partner_matches_teaser' });
                  trackEvent('upgrade_clicked', { source: 'partner_matches_card', score: analysisResult?.overallScore });
                  navigate('/comprehensive-analysis-form');
                }}
                size="lg"
                className="mt-2"
              >
                Get Full Analysis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 blur-sm">
              <Users className="h-5 w-5" />
              Your Top 3 Partner Matches
            </CardTitle>
            <CardDescription className="blur-sm">
              Verified UK service providers tailored to your needs
            </CardDescription>
          </CardHeader>
          <CardContent className="blur-sm">
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg" />
                  <div className="flex-1">
                    <p className="font-semibold">Legal & Compliance Partner</p>
                    <p className="text-sm text-muted-foreground">Specializes in {analysisResult.customerData.industry}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg" />
                  <div className="flex-1">
                    <p className="font-semibold">Financial Services Partner</p>
                    <p className="text-sm text-muted-foreground">Banking and payment setup</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg" />
                  <div className="flex-1">
                    <p className="font-semibold">Marketing & Growth Partner</p>
                    <p className="text-sm text-muted-foreground">UK market entry strategy</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-2 border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background/95 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <div className="text-center p-6">
              <Lock className="h-12 w-12 text-primary mx-auto mb-3" />
              <p className="font-semibold text-lg mb-2">Unlock with Comprehensive Analysis</p>
              <Button 
                onClick={() => {
                  trackFunnel('upgrade_click', { location: 'compliance_roadmap_teaser' });
                  trackEvent('upgrade_clicked', { source: 'compliance_roadmap_card', score: analysisResult?.overallScore });
                  navigate('/comprehensive-analysis-form');
                }}
                size="lg"
                className="mt-2"
              >
                Get Full Analysis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 blur-sm">
              <FileText className="h-5 w-5" />
              Your 12-Month Compliance Roadmap
            </CardTitle>
            <CardDescription className="blur-sm">
              Complete timeline with deadlines and costs
            </CardDescription>
          </CardHeader>
          <CardContent className="blur-sm">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Companies House Registration</p>
                  <p className="text-xs text-muted-foreground">Week 1-2 • £12-50</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                <div>
                  <p className="font-medium text-sm">VAT Registration</p>
                  <p className="text-xs text-muted-foreground">Week 3-4 • Free</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Industry-Specific Certifications</p>
                  <p className="text-xs text-muted-foreground">Month 2-3 • £500-2000</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                <div>
                  <p className="font-medium text-sm">GDPR Compliance Setup</p>
                  <p className="text-xs text-muted-foreground">Month 1-2 • £300-1000</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Upgrade CTA */}
        <Card className="border-2 border-primary bg-gradient-to-br from-primary/10 to-accent/10">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Complete Your Analysis Now
              </CardTitle>
              <Badge variant="destructive" className="animate-pulse">
                87% Upgrade
              </Badge>
            </div>
            <CardDescription>
              Join successful businesses who upgraded to comprehensive analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-background rounded-lg border-2 border-primary/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-lg">100+ businesses succeeded</p>
                  <p className="text-sm text-muted-foreground">95% satisfaction rate</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong>3 verified partner matches</strong> tailored to {analysisResult.customerData.industry}</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong>Compliance roadmap</strong> with exact deadlines and costs</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong>7-category breakdown</strong> showing exactly where to improve</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong>Expert review option</strong> for professional validation</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong>Companies House verification</strong> for UK credibility</span>
                </li>
              </ul>
            </div>
            
            <Button 
              onClick={() => {
                trackFunnel('upgrade_click', { location: 'main_cta_bottom' });
                trackEvent('upgrade_clicked', { 
                  source: 'main_cta', 
                  score: analysisResult?.overallScore,
                  urgencyLevel: analysisResult?.urgencyLevel 
                });
                navigate('/comprehensive-analysis-form');
              }}
              className="w-full"
              size="lg"
            >
              <Zap className="h-4 w-4 mr-2" />
              Get Full Analysis Now
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              💳 No payment required to start • 📊 Analysis ready in 5 minutes • ✅ Money-back guarantee
            </p>
          </CardContent>
        </Card>

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