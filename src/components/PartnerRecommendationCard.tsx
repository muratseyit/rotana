import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight, 
  Users,
  Star,
  Info,
  Award,
  Target
} from "lucide-react";

interface MatchFactor {
  name: string;
  score: number;
  weight: number;
  explanation: string;
}

interface CaseStudy {
  title: string;
  industry: string;
  challenge: string;
  solution: string;
  outcome: string;
}

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
  matchScore?: number;
  matchFactors?: MatchFactor[];
  recommendationReason?: string;
  relevantCaseStudy?: CaseStudy;
}

interface PartnerRecommendation {
  category: string;
  partners: Partner[];
  reason: string;
  urgency?: 'high' | 'medium' | 'low';
  insights?: string[];
  averageMatchScore?: number;
}

interface PartnerRecommendationCardProps {
  recommendation: PartnerRecommendation;
  onViewPartner: (partner: Partner) => void;
  onViewAllInCategory?: () => void;
}

export function PartnerRecommendationCard({ 
  recommendation, 
  onViewPartner, 
  onViewAllInCategory 
}: PartnerRecommendationCardProps) {
  const getUrgencyIcon = () => {
    switch (recommendation.urgency) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'medium':
        return <TrendingUp className="h-4 w-4 text-yellow-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-success" />;
    }
  };

  const getUrgencyColor = () => {
    switch (recommendation.urgency) {
      case 'high':
        return 'border-destructive/30 bg-destructive/5';
      case 'medium':
        return 'border-yellow-500/30 bg-yellow-50';
      default:
        return 'border-success/30 bg-success/5';
    }
  };

  const getUrgencyBadge = () => {
    switch (recommendation.urgency) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">Critical Priority</Badge>;
      case 'medium':
        return <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-700">Medium Priority</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">Low Priority</Badge>;
    }
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-lg ${getUrgencyColor()}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getUrgencyIcon()}
            <CardTitle className="text-lg">{recommendation.category}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {recommendation.averageMatchScore && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                <span className="text-xs text-muted-foreground">{Math.round(recommendation.averageMatchScore)}% avg match</span>
              </div>
            )}
            {getUrgencyBadge()}
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground leading-relaxed">
          {recommendation.reason}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Insights */}
        {recommendation.insights && recommendation.insights.length > 0 && (
          <div className="bg-muted/50 rounded-lg p-3 border">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                {recommendation.insights.map((insight, idx) => (
                  <p key={idx} className="text-xs text-muted-foreground">{insight}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Partner Grid with Enhanced Information */}
        <div className="space-y-3">
          {recommendation.partners.slice(0, 2).map((partner, idx) => (
            <div key={partner.id} className="group">
              <div className="rounded-lg border bg-card hover:border-primary/50 transition-all">
                {/* Partner Header */}
                <div 
                  className="flex items-start gap-3 p-3 cursor-pointer"
                  onClick={() => onViewPartner(partner)}
                >
                  {partner.logo_url ? (
                    <img 
                      src={partner.logo_url} 
                      alt={partner.name}
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-base group-hover:text-primary transition-colors">
                        {partner.name}
                      </h3>
                      {partner.verification_status === 'verified' && (
                        <Badge variant="secondary" className="text-xs">
                          Verified Partner
                        </Badge>
                      )}
                      {partner.matchScore && (
                        <Badge variant={partner.matchScore >= 85 ? "default" : partner.matchScore >= 70 ? "secondary" : "outline"} className="text-xs">
                          {partner.matchScore}% match
                        </Badge>
                      )}
                      <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors ml-auto" />
                    </div>
                    
                    {partner.recommendationReason && (
                      <p className="text-xs text-muted-foreground mb-2">
                        {partner.recommendationReason}
                      </p>
                    )}
                    
                    {partner.specialties && partner.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {partner.specialties.slice(0, 3).map((specialty) => (
                          <Badge key={specialty} variant="outline" className="text-xs px-1.5 py-0.5">
                            {specialty}
                          </Badge>
                        ))}
                        {partner.specialties.length > 3 && (
                          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                            +{partner.specialties.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Match Factors & Case Study - Collapsible */}
                {(partner.matchFactors || partner.relevantCaseStudy) && (
                  <Accordion type="single" collapsible className="border-t">
                    {partner.matchFactors && partner.matchFactors.length > 0 && (
                      <AccordionItem value="match-factors" className="border-b-0">
                        <AccordionTrigger className="px-3 py-2 text-xs hover:no-underline">
                          <div className="flex items-center gap-2">
                            <Target className="h-3 w-3" />
                            <span>Why this match? ({partner.matchFactors.length} factors)</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-3 pb-3">
                          <div className="space-y-2">
                            {partner.matchFactors.map((factor, factorIdx) => (
                              <div key={factorIdx} className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium">{factor.name}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">
                                      Weight: {Math.round(factor.weight * 100)}%
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                      {factor.score}/100
                                    </Badge>
                                  </div>
                                </div>
                                <Progress value={factor.score} className="h-1" />
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {factor.explanation}
                                </p>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )}

                    {partner.relevantCaseStudy && (
                      <AccordionItem value="case-study" className="border-b-0">
                        <AccordionTrigger className="px-3 py-2 text-xs hover:no-underline">
                          <div className="flex items-center gap-2">
                            <Award className="h-3 w-3" />
                            <span>Success Story: {partner.relevantCaseStudy.industry}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-3 pb-3">
                          <div className="space-y-2">
                            <h5 className="text-xs font-semibold">{partner.relevantCaseStudy.title}</h5>
                            
                            <div className="space-y-1.5">
                              <div>
                                <span className="text-xs font-medium text-red-600">Challenge:</span>
                                <p className="text-xs text-muted-foreground">{partner.relevantCaseStudy.challenge}</p>
                              </div>
                              
                              <div>
                                <span className="text-xs font-medium text-blue-600">Solution:</span>
                                <p className="text-xs text-muted-foreground">{partner.relevantCaseStudy.solution}</p>
                              </div>
                              
                              <div>
                                <span className="text-xs font-medium text-green-600">Outcome:</span>
                                <p className="text-xs text-muted-foreground font-medium">{partner.relevantCaseStudy.outcome}</p>
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )}
                  </Accordion>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {recommendation.partners.length > 2 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onViewAllInCategory}
              className="flex-1"
            >
              View All ({recommendation.partners.length} partners)
            </Button>
          )}
          
          <Button 
            size="sm" 
            onClick={() => onViewPartner(recommendation.partners[0])}
            className="flex-1"
          >
            Contact Top Match
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}