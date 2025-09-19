import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PartnerRecommendationCard } from "@/components/PartnerRecommendationCard";
import { 
  TrendingUp, 
  Users, 
  AlertCircle, 
  CheckCircle2,
  ArrowRight,
  Lightbulb
} from "lucide-react";

interface Partner {
  id: string;
  name: string;
  description: string;
  category: string;
  specialties: string[];
  website_url: string | null;
  contact_email: string | null;
  phone: string | null;
  location: string | null;
  logo_url: string | null;
  verification_status: string;
}

interface PartnerRecommendation {
  category: string;
  partners: Partner[];
  reason: string;
  urgency?: 'high' | 'medium' | 'low';
  matchScore?: number;
}

interface BusinessAnalysis {
  overallScore: number;
  scoreBreakdown: {
    productMarketFit: number;
    regulatoryCompatibility: number;
    investmentReadiness: number;
    logisticsPotential: number;
    digitalReadiness: number;
    founderTeamStrength: number;
    scalabilityAutomation: number;
  };
  partnerRecommendations?: PartnerRecommendation[];
}

interface IntelligentPartnerDashboardProps {
  businessAnalysis: BusinessAnalysis;
  businessData?: {
    company_name?: string;
    industry?: string;
    company_size?: string;
  };
  onContactPartner: (partner: Partner) => void;
  onExploreCategory?: (category: string) => void;
}

export function IntelligentPartnerDashboard({ 
  businessAnalysis, 
  businessData,
  onContactPartner,
  onExploreCategory 
}: IntelligentPartnerDashboardProps) {
  const [prioritizedRecommendations, setPrioritizedRecommendations] = useState<PartnerRecommendation[]>([]);

  useEffect(() => {
    if (businessAnalysis.partnerRecommendations) {
      // Sort recommendations by urgency and match score
      const sorted = [...businessAnalysis.partnerRecommendations].sort((a, b) => {
        const urgencyOrder = { high: 3, medium: 2, low: 1 };
        const aUrgency = urgencyOrder[a.urgency || 'low'];
        const bUrgency = urgencyOrder[b.urgency || 'low'];
        
        if (aUrgency !== bUrgency) {
          return bUrgency - aUrgency;
        }
        
        return (b.matchScore || 0) - (a.matchScore || 0);
      });
      
      setPrioritizedRecommendations(sorted);
    }
  }, [businessAnalysis]);

  const criticalCount = prioritizedRecommendations.filter(r => r.urgency === 'high').length;
  const mediumCount = prioritizedRecommendations.filter(r => r.urgency === 'medium').length;
  const totalPartners = prioritizedRecommendations.reduce((sum, r) => sum + r.partners.length, 0);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-yellow-600';
    return 'text-destructive';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle2 className="h-4 w-4 text-success" />;
    if (score >= 60) return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    return <AlertCircle className="h-4 w-4 text-destructive" />;
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Intelligent Partner Recommendations</h2>
        <p className="text-muted-foreground">
          AI-powered partner matching based on your {businessData?.industry} business analysis
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Overall Readiness</p>
              <div className="flex items-center gap-1">
                {getScoreIcon(businessAnalysis.overallScore)}
                <span className={`text-lg font-bold ${getScoreColor(businessAnalysis.overallScore)}`}>
                  {businessAnalysis.overallScore}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Critical Areas</p>
              <p className="text-lg font-bold">{criticalCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Improvements</p>
              <p className="text-lg font-bold">{mediumCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 bg-success/10 rounded-lg">
              <Users className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Matched Partners</p>
              <p className="text-lg font-bold">{totalPartners}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Insights */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Lightbulb className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-primary mb-2">Smart Insights</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                {businessAnalysis.overallScore < 60 && (
                  <p>• Your business needs significant support before UK market entry. Focus on critical partners first.</p>
                )}
                {criticalCount > 0 && (
                  <p>• {criticalCount} critical area{criticalCount > 1 ? 's' : ''} require immediate attention for compliance and success.</p>
                )}
                {businessAnalysis.scoreBreakdown.regulatoryCompatibility < 50 && (
                  <p>• Legal compliance is your top priority - start with regulatory partners immediately.</p>
                )}
                {businessAnalysis.scoreBreakdown.digitalReadiness < 60 && (
                  <p>• Strong digital presence is essential for UK market success - consider marketing partners early.</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Priority Recommendations */}
      {prioritizedRecommendations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Priority Recommendations</h3>
            <Badge variant="outline" className="text-sm">
              {prioritizedRecommendations.length} categories matched
            </Badge>
          </div>

          <div className="grid gap-4">
            {prioritizedRecommendations.map((recommendation, index) => (
              <PartnerRecommendationCard
                key={`${recommendation.category}-${index}`}
                recommendation={recommendation}
                onViewPartner={onContactPartner}
                onViewAllInCategory={() => onExploreCategory?.(recommendation.category)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Action Center */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <Button variant="default" className="justify-start gap-2">
              <Users className="h-4 w-4" />
              Contact Priority Partners
            </Button>
            <Button variant="outline" className="justify-start gap-2">
              <TrendingUp className="h-4 w-4" />
              Schedule Strategy Call
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Our intelligent matching algorithm has identified the most relevant partners for your {businessData?.industry} business. 
            Start with critical priorities to ensure successful UK market entry.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}