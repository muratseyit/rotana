import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PartnerCard } from "@/components/PartnerCard";
import { 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight, 
  Users,
  Star
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
            {recommendation.matchScore && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                <span className="text-xs text-muted-foreground">{Math.round(recommendation.matchScore)}% match</span>
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
        {/* Partner Grid */}
        <div className="grid gap-3">
          {recommendation.partners.slice(0, 2).map((partner) => (
            <div key={partner.id} className="group">
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                   onClick={() => onViewPartner(partner)}>
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
                    <h4 className="font-medium text-sm group-hover:text-primary transition-colors">
                      {partner.name}
                    </h4>
                    <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {partner.description}
                  </p>
                  
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