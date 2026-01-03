import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ExpertReviewDialog } from "./ExpertReviewDialog";
import { ExportReportDialog } from "./ExportReportDialog";
import { 
  CheckCircle, 
  Circle, 
  Target, 
  TrendingUp, 
  Zap, 
  Shield, 
  Truck, 
  Users, 
  Brain, 
  Lightbulb, 
  AlertCircle, 
  ExternalLink,
  Mail,
  Globe,
  Building,
  Download,
  Share2,
  BarChart3,
  ArrowUpRight,
  Info,
  Database,
  Activity,
  Clock,
  UserCheck,
  MessageSquare
} from "lucide-react";

import { ScoreInfluenceCard } from "./ScoreInfluenceCard";
import { formatMarketSize, formatTradeVolume, getCompetitionLabel, formatTimelineRange, formatTariffRate } from "@/utils/marketIntelligence";

interface PartnerRecommendation {
  category: string;
  partners: Array<{
    id: string;
    name: string;
    description: string;
    specialties: string[];
    contact_email: string;
    website_url: string;
  }>;
  reason: string;
}

interface ScoreBreakdown {
  productMarketFit: number;
  regulatoryCompatibility: number;
  digitalReadiness: number;
  logisticsPotential: number;
  scalabilityAutomation: number;
  founderTeamStrength: number;
  investmentReadiness?: number;
}

interface ScoreInfluence {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  points: number;
  evidence: string;
}

interface ScoreEvidence {
  category: string;
  score: number;
  factors: ScoreInfluence[];
}

interface DetailedInsight {
  category: keyof ScoreBreakdown;
  score: number;
  strengths: string[];
  weaknesses: string[];
  actionItems: {
    action: string;
    priority: "high" | "medium" | "low";
    timeframe: string;
    resources?: string[];
  }[];
}

interface AnalysisResult {
  overallScore: number;
  scoreBreakdown: ScoreBreakdown;
  scoreEvidence?: ScoreEvidence[];
  roadmap: string[];
  summary: string;
  detailedInsights?: DetailedInsight[];
  recommendations?: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  complianceAssessment?: {
    criticalRequirements: string[];
    riskAreas: string[];
    complianceScore: number;
  };
  partnerRecommendations?: PartnerRecommendation[];
  timestamp?: string;
  metadata?: {
    dataCompleteness: {
      score: number;
      missingFields?: string[];
      completedSections?: string[];
    };
    analysisVersion: string;
    modelUsed: string;
    analysisDate: string;
    confidenceLevel: string;
    scoringMethod?: string;
    companyVerification?: {
      verified: boolean;
      data?: any;
      insights?: any;
    };
    industryBenchmark?: any;
    regulatoryRequirements?: any[];
    dataSourcesUsed?: string[];
    marketIntelligence?: {
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
    };
  };
}

interface EnhancedAnalysisResultsProps {
  analysis: AnalysisResult;
  companyName: string;
  onViewProgress?: () => void;
}

const scoreCategories = [
  {
    key: 'productMarketFit' as keyof ScoreBreakdown,
    label: 'Product-Market Fit',
    icon: Target,
    description: 'UK market demand and competition analysis'
  },
  {
    key: 'regulatoryCompatibility' as keyof ScoreBreakdown,
    label: 'Regulatory Compatibility',
    icon: Shield,
    description: 'UK compliance and legal requirements'
  },
  {
    key: 'digitalReadiness' as keyof ScoreBreakdown,
    label: 'Digital Readiness',
    icon: Zap,
    description: 'Online presence and e-commerce capability'
  },
  {
    key: 'logisticsPotential' as keyof ScoreBreakdown,
    label: 'Logistics Potential',
    icon: Truck,
    description: 'Supply chain and fulfillment readiness'
  },
  {
    key: 'scalabilityAutomation' as keyof ScoreBreakdown,
    label: 'Scalability & Automation',
    icon: TrendingUp,
    description: 'Growth potential and operational efficiency'
  },
  {
    key: 'founderTeamStrength' as keyof ScoreBreakdown,
    label: 'Founder/Team Strength',
    icon: Users,
    description: 'Experience and UK market knowledge'
  },
  {
    key: 'investmentReadiness' as keyof ScoreBreakdown,
    label: 'Investment Readiness',
    icon: Building,
    description: 'Financial preparedness for UK expansion'
  },
  {
    key: 'marketOpportunity' as keyof ScoreBreakdown,
    label: 'Market Opportunity',
    icon: Lightbulb,
    description: 'UK market potential and trade opportunity'
  }
];

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
  if (score >= 80) return 'default';
  if (score >= 60) return 'secondary';
  return 'destructive';
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high": return "destructive";
    case "medium": return "secondary";
    case "low": return "outline";
    default: return "outline";
  }
};

export function EnhancedAnalysisResults({ analysis, companyName, onViewProgress }: EnhancedAnalysisResultsProps) {
  const confidenceLevel = analysis.metadata?.confidenceLevel || 'medium';
  const dataCompleteness = analysis.metadata?.dataCompleteness?.score || 0;
  const scoringMethod = analysis.metadata?.scoringMethod || 'AI-based analysis';
  const dataSourcesUsed = analysis.metadata?.dataSourcesUsed || [];
  const companyVerified = analysis.metadata?.companyVerification?.verified || false;

  return (
    <div className="space-y-6">
      {/* AI Disclaimer Alert */}
      <Alert className="border-primary/20 bg-primary/5">
        <AlertCircle className="h-4 w-4 text-primary" />
        <AlertTitle>Important Disclaimer</AlertTitle>
        <AlertDescription>
          This analysis is AI-generated and provided for informational purposes only. It does not constitute legal, financial, or professional advice. Please consult with qualified professionals before making any business decisions.
        </AlertDescription>
      </Alert>

      {/* Analysis Methodology & Data Quality Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Analysis Methodology & Data Quality
          </CardTitle>
          <CardDescription>
            Understanding how your score was calculated and data sources used
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Data Completeness */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Data Completeness
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant={dataCompleteness >= 80 ? "default" : dataCompleteness >= 60 ? "secondary" : "destructive"}>
                        {dataCompleteness}%
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Percentage of critical data fields provided</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Progress value={dataCompleteness} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {dataCompleteness >= 80 ? 'Excellent - All critical fields completed' :
                 dataCompleteness >= 60 ? 'Good - Most fields completed' :
                 'Incomplete - More data needed for accurate analysis'}
              </p>
            </div>

            {/* Confidence Level */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Confidence Level
                </span>
                <Badge variant={confidenceLevel === 'high' ? "default" : confidenceLevel === 'medium' ? "secondary" : "outline"}>
                  {confidenceLevel.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {confidenceLevel === 'high' ? 'High confidence based on complete data' :
                 confidenceLevel === 'medium' ? 'Medium confidence - some data gaps' :
                 'Low confidence - limited data available'}
              </p>
            </div>

            {/* Company Verification */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Verification Status
                </span>
                <Badge variant={companyVerified ? "default" : "outline"}>
                  {companyVerified ? 'VERIFIED' : 'UNVERIFIED'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {companyVerified 
                  ? 'Company verified via Companies House API' 
                  : 'Company not verified - UK registration recommended'}
              </p>
            </div>
          </div>

          {/* Scoring Methodology */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold mb-2">Scoring Methodology</h4>
            <p className="text-sm text-muted-foreground mb-3">
              {scoringMethod === 'evidence-based-algorithms' 
                ? 'Your scores are calculated using research-backed algorithms that analyze specific business attributes against UK market benchmarks. Each category uses weighted formulas based on industry best practices.'
                : 'Scores generated using AI analysis of business data and market conditions.'}
            </p>
            
            {dataSourcesUsed.length > 0 && (
              <div>
                <h5 className="text-xs font-semibold mb-2">Data Sources Used:</h5>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {dataSourcesUsed.map((source, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>{source}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Missing Data Alert */}
          {dataCompleteness < 80 && analysis.metadata?.dataCompleteness?.missingFields && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Improve Analysis Accuracy</AlertTitle>
              <AlertDescription>
                Provide additional information to increase data completeness and confidence:
                <ul className="list-disc ml-5 mt-2 text-sm">
                  {analysis.metadata.dataCompleteness.missingFields.slice(0, 5).map((field, idx) => (
                    <li key={idx}>{field.replace(/([A-Z])/g, ' $1').trim()}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* High-Value Analysis Alert - Flag for Expert Review */}
      {(analysis.overallScore < 60 || companyVerified || dataCompleteness >= 85) && (
        <Alert className="border-primary">
          <UserCheck className="h-4 w-4" />
          <AlertTitle>Expert Review Recommended</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <div>
              {analysis.overallScore < 60 
                ? "Your analysis shows areas that could benefit from expert guidance. Our UK market specialists can provide targeted recommendations."
                : companyVerified
                ? "Your company is verified with Companies House. An expert review can help you maximize your UK market entry strategy."
                : "Your analysis is comprehensive. Consider an expert review to validate findings and uncover additional opportunities."}
            </div>
            <ExpertReviewDialog
              trigger={
                <Button variant="default" size="sm" className="ml-4">
                  Get Expert Review
                </Button>
              }
            />
          </AlertDescription>
        </Alert>
      )}

      {/* Rest of the existing content */}
      {/* Overall Score Header */}
      <Card className="bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 border-primary/20 shadow-elegant">
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center justify-center gap-2 text-3xl">
            <div className="p-2 rounded-full bg-gradient-primary">
              <Brain className="h-6 w-6 text-white" />
            </div>
            UK Market Readiness Assessment
          </CardTitle>
          <p className="text-muted-foreground text-lg">{companyName}</p>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {analysis.overallScore}%
              </div>
              <div className="absolute -top-2 -right-8">
                <div className="animate-bounce">
                  <BarChart3 className="h-8 w-8 text-primary/60" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center gap-3">
            <Badge 
              variant={getScoreBadgeVariant(analysis.overallScore)}
              className="text-base px-6 py-2 font-semibold"
            >
              {analysis.overallScore >= 80 ? '🚀 High Readiness' : 
               analysis.overallScore >= 60 ? '⚡ Moderate Readiness' : 
               '🔧 Needs Development'}
            </Badge>
          </div>
          
          <p className="text-muted-foreground max-w-3xl mx-auto text-lg leading-relaxed">
            {analysis.summary}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            {onViewProgress && (
              <Button variant="outline" onClick={onViewProgress} className="gap-2">
                <TrendingUp className="h-4 w-4" />
                View Progress History
              </Button>
            )}
            <ExportReportDialog
              companyName={companyName}
              overallScore={analysis.overallScore}
              analysis={analysis}
              trigger={
                <Button className="gap-2">
                  <Download className="h-4 w-4" />
                  Export Report
                </Button>
              }
            />
            <ExpertReviewDialog
              analysisId={analysis.metadata?.analysisDate}
              trigger={
                <Button variant="outline" className="gap-2">
                  <UserCheck className="h-4 w-4" />
                  Request Expert Review
                </Button>
              }
            />
            <Button variant="outline" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share Results
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="market">Market Intel</TabsTrigger>
          <TabsTrigger value="partners">Partners</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Score Breakdown */}
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Detailed Score Breakdown
                </CardTitle>
                <Badge variant="outline" className="text-sm">
                  {scoreCategories.filter(cat => analysis.scoreBreakdown[cat.key] !== undefined).length} Categories Analyzed
                </Badge>
              </div>
              <CardDescription>
                Evidence-based analysis using proprietary scoring algorithms
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Score Evidence Cards - New Evidence-Based Display */}
              {analysis.scoreEvidence && analysis.scoreEvidence.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {analysis.scoreEvidence.map((evidence) => {
                    const categoryKey = evidence.category
                      .toLowerCase()
                      .replace(/ & /g, '')
                      .replace(/ /g, '')
                      .replace('founder/team', 'founderTeam') as keyof ScoreBreakdown;
                    
                    return (
                      <ScoreInfluenceCard
                        key={evidence.category}
                        category={evidence.category}
                        score={evidence.score}
                        influences={evidence.factors}
                      />
                    );
                  })}
                </div>
              ) : (
                /* Fallback to original grid display if no evidence */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {scoreCategories.map((category) => {
                    const score = analysis.scoreBreakdown[category.key];
                    if (score === undefined) return null;
                    
                    const Icon = category.icon;
                    
                    return (
                      <div key={category.key} className="group space-y-4 p-4 rounded-lg border bg-gradient-to-br from-card to-muted/20 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <span className="font-semibold text-lg">{category.label}</span>
                              <p className="text-sm text-muted-foreground">{category.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
                              {score}%
                            </div>
                            <Badge variant={getScoreBadgeVariant(score)} className="mt-1">
                              {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Work'}
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Progress value={score} className="h-3" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>0%</span>
                            <span className="font-medium">Current: {score}%</span>
                            <span>100%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Analysis Summary */}
              <div className="mt-8 space-y-4">
                {/* Strong Areas */}
                <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <h4 className="font-medium mb-3 flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    Your Strongest Areas (80%+)
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    {scoreCategories
                      .filter(cat => analysis.scoreBreakdown[cat.key] && analysis.scoreBreakdown[cat.key] >= 80)
                      .map((category, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-green-700">
                          <CheckCircle className="h-3 w-3" />
                          <span className="font-medium">{category.label}</span>
                          <Badge variant="outline" className="ml-auto bg-green-100 text-green-700 border-green-300">
                            {analysis.scoreBreakdown[category.key]}%
                          </Badge>
                        </div>
                      ))}
                    {scoreCategories.filter(cat => analysis.scoreBreakdown[cat.key] && analysis.scoreBreakdown[cat.key] >= 80).length === 0 && (
                      <p className="text-green-600 italic">Focus on strengthening key areas to reach excellence level (80%+)</p>
                    )}
                  </div>
                </div>

                {/* Areas Needing Attention */}
                <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                  <h4 className="font-medium mb-3 flex items-center gap-2 text-orange-700">
                    <AlertCircle className="h-4 w-4" />
                    Priority Improvement Areas (Below 70%)
                  </h4>
                  <div className="space-y-3">
                    {scoreCategories
                      .filter(cat => analysis.scoreBreakdown[cat.key] && analysis.scoreBreakdown[cat.key] < 70)
                      .map((category, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-3 w-3 text-orange-600" />
                            <span className="font-medium text-orange-800">{category.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="destructive" className="bg-orange-100 text-orange-700 border-orange-300">
                              {analysis.scoreBreakdown[category.key]}%
                            </Badge>
                            <span className="text-xs text-orange-600">Partner support recommended</span>
                          </div>
                        </div>
                      ))}
                    {scoreCategories.filter(cat => analysis.scoreBreakdown[cat.key] && analysis.scoreBreakdown[cat.key] < 70).length === 0 && (
                      <p className="text-orange-600 italic">Excellent! All areas are performing well (70%+)</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Intelligence Tab - NEW */}
        <TabsContent value="market" className="space-y-6">
          {analysis.metadata?.marketIntelligence ? (
            <>
              {/* Market Opportunity Overview */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-blue-600" />
                    UK Market Opportunity
                  </CardTitle>
                  <CardDescription>
                    Converta Market Intelligence analysis for your industry
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-white dark:bg-background rounded-lg border">
                      <p className="text-xs text-muted-foreground mb-1">Addressable Market</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatMarketSize(analysis.metadata.marketIntelligence.marketSizeGBP)}
                      </p>
                    </div>
                    <div className="p-4 bg-white dark:bg-background rounded-lg border">
                      <p className="text-xs text-muted-foreground mb-1">Annual Growth</p>
                      <p className="text-2xl font-bold text-green-600">
                        {analysis.metadata.marketIntelligence.growthRate}%
                      </p>
                    </div>
                    <div className="p-4 bg-white dark:bg-background rounded-lg border">
                      <p className="text-xs text-muted-foreground mb-1">Competition Level</p>
                      <p className={`text-2xl font-bold ${
                        getCompetitionLabel(analysis.metadata.marketIntelligence.saturationLevel) === 'Low' 
                          ? 'text-green-600' 
                          : getCompetitionLabel(analysis.metadata.marketIntelligence.saturationLevel) === 'Medium'
                          ? 'text-yellow-600'
                          : 'text-orange-600'
                      }`}>
                        {getCompetitionLabel(analysis.metadata.marketIntelligence.saturationLevel)}
                      </p>
                    </div>
                    <div className="p-4 bg-white dark:bg-background rounded-lg border">
                      <p className="text-xs text-muted-foreground mb-1">Entry Opportunity</p>
                      <Badge variant={
                        analysis.metadata.marketIntelligence.entryOpportunity === 'excellent' ? 'default' :
                        analysis.metadata.marketIntelligence.entryOpportunity === 'good' ? 'secondary' : 'outline'
                      } className="text-lg px-3 py-1 capitalize">
                        {analysis.metadata.marketIntelligence.entryOpportunity}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trade Intelligence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      Turkey-UK Trade Flow
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm">Annual Trade Volume</span>
                      <span className="text-xl font-bold text-primary">
                        {formatTradeVolume(analysis.metadata.marketIntelligence.tradeVolumeGBP)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm">Active Turkish Exporters</span>
                      <span className="text-xl font-bold">
                        ~{analysis.metadata.marketIntelligence.turkishExporterCount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                      <span className="text-sm font-medium text-green-700 dark:text-green-400">UK-Turkey FTA Benefit</span>
                      <Badge variant="default" className="bg-green-600">
                        {analysis.metadata.marketIntelligence.ftaBenefit ? 'Eligible' : 'Check Requirements'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Clock className="h-5 w-5 text-purple-600" />
                      Entry Timeline Estimate
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <p className="text-3xl font-bold text-purple-600">
                        {formatTimelineRange(
                          analysis.metadata.marketIntelligence.timelineMin,
                          analysis.metadata.marketIntelligence.timelineMax
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">Estimated market entry timeline</p>
                    </div>
                    
                    {analysis.metadata.marketIntelligence.suggestedHSCode && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Suggested HS Code Classification</p>
                        <p className="font-mono font-bold">Chapter {analysis.metadata.marketIntelligence.suggestedHSCode}</p>
                        <p className="text-xs text-muted-foreground">{analysis.metadata.marketIntelligence.hsCodeDescription}</p>
                        {analysis.metadata.marketIntelligence.tariffRate !== undefined && (
                          <p className="text-xs mt-2 text-green-600 font-medium">
                            {formatTariffRate(
                              analysis.metadata.marketIntelligence.tariffRate,
                              analysis.metadata.marketIntelligence.ftaTariffRate || 0
                            )}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Niche Opportunities */}
              {(analysis.metadata.marketIntelligence.nichePotential?.length > 0 || 
                analysis.metadata.marketIntelligence.marketGaps?.length > 0) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-orange-600" />
                      Competitive Positioning Insights
                    </CardTitle>
                    <CardDescription>
                      Market opportunities and niche potentials identified by Converta Intelligence
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {analysis.metadata.marketIntelligence.nichePotential && 
                       analysis.metadata.marketIntelligence.nichePotential.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-yellow-500" />
                            Niche Opportunities
                          </h4>
                          <ul className="space-y-2">
                            {analysis.metadata.marketIntelligence.nichePotential.map((niche, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{niche}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {analysis.metadata.marketIntelligence.marketGaps && 
                       analysis.metadata.marketIntelligence.marketGaps.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <ArrowUpRight className="h-4 w-4 text-blue-500" />
                            Market Gaps to Exploit
                          </h4>
                          <ul className="space-y-2">
                            {analysis.metadata.marketIntelligence.marketGaps.map((gap, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <ArrowUpRight className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span>{gap}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Data Source Attribution */}
              <Alert className="border-primary/20 bg-primary/5">
                <Database className="h-4 w-4" />
                <AlertTitle>Converta Market Intelligence</AlertTitle>
                <AlertDescription>
                  This analysis is powered by Converta's proprietary market intelligence engine, incorporating UK government statistics, 
                  trade flow data, industry benchmarks, and competitive analysis. Data is refreshed regularly to ensure accuracy.
                </AlertDescription>
              </Alert>
            </>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Market intelligence data is being compiled. Please run a new analysis to access full market insights.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="partners" className="space-y-6">
          {/* Partner Recommendations */}
          {analysis.partnerRecommendations && analysis.partnerRecommendations.length > 0 ? (
            <div className="space-y-6">
              <Card className="bg-gradient-to-r from-secondary/5 to-accent/5 border-secondary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-secondary" />
                    Recommended UK Partners
                  </CardTitle>
                  <CardDescription>
                    AI-matched partners based on your specific business needs and analysis results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Verified Partners
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      Compliance Experts
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-purple-600" />
                      Industry Specialists
                    </div>
                  </div>
                </CardContent>
              </Card>

              {analysis.partnerRecommendations.map((recommendation, index) => (
                <Card key={index} className="shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl text-primary">{recommendation.category}</CardTitle>
                      <Badge variant="secondary" className="px-3 py-1">
                        {recommendation.partners.length} Partner{recommendation.partners.length !== 1 ? 's' : ''} Available
                      </Badge>
                    </div>
                    <CardDescription className="text-base">{recommendation.reason}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                      {recommendation.partners.map((partner) => (
                        <Card key={partner.id} className="border-l-4 border-l-primary hover:shadow-md transition-all bg-gradient-to-r from-card to-primary/5">
                          <CardContent className="p-6 space-y-4">
                            <div>
                              <h5 className="text-lg font-semibold text-primary">{partner.name}</h5>
                              <p className="text-muted-foreground line-clamp-3 leading-relaxed">
                                {partner.description}
                              </p>
                            </div>
                            
                            {partner.specialties && partner.specialties.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {partner.specialties.slice(0, 4).map((specialty, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs bg-primary/5">
                                    {specialty}
                                  </Badge>
                                ))}
                                {partner.specialties.length > 4 && (
                                  <Badge variant="outline" className="text-xs bg-muted">
                                    +{partner.specialties.length - 4} more
                                  </Badge>
                                )}
                              </div>
                            )}
                            
                            <div className="flex gap-2 pt-2">
                              {partner.contact_email && (
                                <Button 
                                  size="sm" 
                                  className="flex-1 gap-2"
                                  onClick={() => window.open(`mailto:${partner.contact_email}?subject=Partnership Inquiry - ${companyName}`, '_blank')}
                                >
                                  <Mail className="h-3 w-3" />
                                  Contact
                                </Button>
                              )}
                              {partner.website_url && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="gap-2"
                                  onClick={() => window.open(partner.website_url, '_blank')}
                                >
                                  <Globe className="h-3 w-3" />
                                  Website
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center p-8">
              <CardContent className="space-y-4">
                <div className="p-4 rounded-full bg-green-100 w-fit mx-auto">
                  <Users className="h-12 w-12 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-green-700">Excellent Market Readiness!</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Your business shows strong readiness across all key areas. While you may not need immediate assistance, 
                  our partner directory offers additional opportunities for growth and expansion.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => window.open('/partners', '_blank')}
                  >
                    <Building className="h-4 w-4" />
                    Explore All Partners
                  </Button>
                  <Button 
                    className="gap-2"
                    onClick={() => window.open('/partners?category=growth', '_blank')}
                  >
                    <TrendingUp className="h-4 w-4" />
                    Growth Partners
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {analysis.detailedInsights ? (
            analysis.detailedInsights.map((insight) => {
              const category = scoreCategories.find(cat => cat.key === insight.category);
              const Icon = category?.icon || Target;
              
              return (
                <Card key={insight.category}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Icon className="h-5 w-5" />
                        {category?.label}
                        <Badge variant={getScoreBadgeVariant(insight.score)} className="ml-2">
                          {insight.score}%
                        </Badge>
                      </CardTitle>
                      <ExpertReviewDialog
                        insightCategory={category?.label}
                        trigger={
                          <Button variant="ghost" size="sm" className="gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Ask Expert
                          </Button>
                        }
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Strengths */}
                    {insight.strengths.length > 0 && (
                      <div>
                        <h4 className="font-medium text-green-700 mb-2 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Strengths
                        </h4>
                        <ul className="space-y-1">
                          {insight.strengths.map((strength, index) => (
                            <li key={index} className="text-sm text-muted-foreground pl-4">
                              • {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Weaknesses */}
                    {insight.weaknesses.length > 0 && (
                      <div>
                        <h4 className="font-medium text-red-700 mb-2 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Areas for Improvement
                        </h4>
                        <ul className="space-y-1">
                          {insight.weaknesses.map((weakness, index) => (
                            <li key={index} className="text-sm text-muted-foreground pl-4">
                              • {weakness}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Action Items */}
                    {insight.actionItems.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Lightbulb className="h-4 w-4" />
                          Recommended Actions
                        </h4>
                        <div className="space-y-3">
                          {insight.actionItems.map((action, index) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-medium">{action.action}</p>
                                <Badge variant={getPriorityColor(action.priority) as any} className="text-xs">
                                  {action.priority}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Timeline: {action.timeframe}
                              </p>
                              {action.resources && action.resources.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {action.resources.map((resource, idx) => (
                                    <a 
                                      key={idx}
                                      href={resource}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-primary hover:underline flex items-center gap-1"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                      Resource
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  Detailed insights will be available in the next analysis update.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="roadmap" className="space-y-6">
          {/* Prioritized Roadmap */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                UK Market Entry Roadmap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Priority actions to improve your UK market readiness:
                </p>
                <div className="space-y-3">
                  {analysis.roadmap.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <p className="text-sm leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time-based Recommendations */}
          {analysis.recommendations && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Immediate Actions</CardTitle>
                  <p className="text-xs text-muted-foreground">Next 30 days</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.recommendations.immediate.map((item, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <Circle className="h-3 w-3 mt-1 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Short-term Goals</CardTitle>
                  <p className="text-xs text-muted-foreground">3-6 months</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.recommendations.shortTerm.map((item, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <Circle className="h-3 w-3 mt-1 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Long-term Strategy</CardTitle>
                  <p className="text-xs text-muted-foreground">6+ months</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.recommendations.longTerm.map((item, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <Circle className="h-3 w-3 mt-1 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Compliance Assessment */}
          {analysis.complianceAssessment && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Compliance Assessment
                  <Badge variant={getScoreBadgeVariant(analysis.complianceAssessment.complianceScore)} className="ml-auto">
                    {analysis.complianceAssessment.complianceScore}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysis.complianceAssessment.criticalRequirements.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Critical UK Requirements</h4>
                    <ul className="space-y-1">
                      {analysis.complianceAssessment.criticalRequirements.map((req, index) => (
                        <li key={index} className="text-sm text-muted-foreground pl-4">
                          • {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.complianceAssessment.riskAreas.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-yellow-700">Risk Areas</h4>
                    <ul className="space-y-1">
                      {analysis.complianceAssessment.riskAreas.map((risk, index) => (
                        <li key={index} className="text-sm text-muted-foreground pl-4">
                          • {risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Analysis Metadata */}
      {analysis.timestamp && (
        <div className="text-xs text-muted-foreground text-center">
          Analysis completed on {new Date(analysis.timestamp).toLocaleString()}
        </div>
      )}
    </div>
  );
}