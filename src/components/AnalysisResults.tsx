import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, Target, TrendingUp, Zap, Shield, Truck, Users, Brain } from "lucide-react";

interface ScoreBreakdown {
  productMarketFit: number;
  regulatoryCompatibility: number;
  digitalReadiness: number;
  logisticsPotential: number;
  scalabilityAutomation: number;
  founderTeamStrength: number;
}

interface AnalysisResult {
  overallScore: number;
  scoreBreakdown: ScoreBreakdown;
  roadmap: string[];
  summary: string;
}

interface AnalysisResultsProps {
  analysis: AnalysisResult;
  companyName: string;
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

export function AnalysisResults({ analysis, companyName }: AnalysisResultsProps) {
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
          </div>
        </CardContent>
      </Card>

      {/* Score Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Detailed Score Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scoreCategories.map((category) => {
              const score = analysis.scoreBreakdown[category.key];
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

      {/* UK Readiness Roadmap */}
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
    </div>
  );
}