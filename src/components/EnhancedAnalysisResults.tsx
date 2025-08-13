import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
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
  Building
} from "lucide-react";

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
  return (
    <div className="space-y-6">
      {/* Overall Score Header */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Brain className="h-6 w-6 text-primary" />
            UK Market Readiness Assessment
          </CardTitle>
          <p className="text-muted-foreground">{companyName}</p>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="text-4xl font-bold text-primary">
                {analysis.overallScore}%
              </div>
            </div>
            <Badge 
              variant={getScoreBadgeVariant(analysis.overallScore)}
              className="text-sm px-4 py-1"
            >
              {analysis.overallScore >= 80 ? 'High Readiness' : 
               analysis.overallScore >= 60 ? 'Moderate Readiness' : 
               'Needs Development'}
            </Badge>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {analysis.summary}
            </p>
            {onViewProgress && (
              <Button variant="outline" onClick={onViewProgress} className="mt-4">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Progress History
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="partners">Partners</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Score Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Score Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {scoreCategories.map((category) => {
                  const score = analysis.scoreBreakdown[category.key];
                  if (score === undefined) return null; // Skip if score not available
                  
                  const Icon = category.icon;
                  
                  return (
                    <div key={category.key} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{category.label}</span>
                        </div>
                        <span className={`font-bold ${getScoreColor(score)}`}>
                          {score}%
                        </span>
                      </div>
                      <Progress value={score} className="h-2" />
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="partners" className="space-y-6">
          {/* Partner Recommendations */}
          {analysis.partnerRecommendations && analysis.partnerRecommendations.length > 0 ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Recommended UK Partners
                  </CardTitle>
                  <CardDescription>
                    Verified partners to help address your specific needs based on the analysis
                  </CardDescription>
                </CardHeader>
              </Card>

              {analysis.partnerRecommendations.map((recommendation, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{recommendation.category}</CardTitle>
                    <CardDescription>{recommendation.reason}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      {recommendation.partners.map((partner) => (
                        <Card key={partner.id} className="border-l-4 border-l-primary">
                          <CardContent className="p-4 space-y-3">
                            <div>
                              <h5 className="font-medium">{partner.name}</h5>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {partner.description}
                              </p>
                            </div>
                            
                            {partner.specialties && partner.specialties.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {partner.specialties.slice(0, 3).map((specialty, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {specialty}
                                  </Badge>
                                ))}
                                {partner.specialties.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{partner.specialties.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            )}
                            
                            <div className="flex gap-2">
                              {partner.contact_email && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="flex-1"
                                  onClick={() => window.open(`mailto:${partner.contact_email}`, '_blank')}
                                >
                                  <Mail className="h-3 w-3 mr-1" />
                                  Contact
                                </Button>
                              )}
                              {partner.website_url && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => window.open(partner.website_url, '_blank')}
                                >
                                  <Globe className="h-3 w-3 mr-1" />
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
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Partner Recommendations</h3>
                <p className="text-muted-foreground">
                  Your business shows good readiness across all areas. You can still explore our partner directory for additional support.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => window.open('/partners', '_blank')}
                >
                  View Partner Directory
                </Button>
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
                    <CardTitle className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      {category?.label}
                      <Badge variant={getScoreBadgeVariant(insight.score)} className="ml-auto">
                        {insight.score}%
                      </Badge>
                    </CardTitle>
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