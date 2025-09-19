import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PricingSection } from "@/components/PricingSection";
import { 
  Crown, 
  Lock, 
  Users, 
  BarChart3, 
  FileText, 
  CheckCircle2,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { useState } from "react";

interface SubscriptionGateProps {
  title: string;
  description: string;
  feature: 'comprehensive-analysis' | 'partner-recommendations' | 'advanced-reports';
  currentAnalysis?: {
    overallScore: number;
    industry: string;
    companyName: string;
  };
  onUpgrade?: () => void;
}

export function SubscriptionGate({ 
  title, 
  description, 
  feature, 
  currentAnalysis,
  onUpgrade 
}: SubscriptionGateProps) {
  const [showPricing, setShowPricing] = useState(false);

  const getFeatureIcon = () => {
    switch (feature) {
      case 'comprehensive-analysis':
        return <BarChart3 className="h-6 w-6 text-primary" />;
      case 'partner-recommendations':
        return <Users className="h-6 w-6 text-primary" />;
      case 'advanced-reports':
        return <FileText className="h-6 w-6 text-primary" />;
      default:
        return <Crown className="h-6 w-6 text-primary" />;
    }
  };

  const getFeatureBenefits = () => {
    switch (feature) {
      case 'comprehensive-analysis':
        return [
          'Detailed 7-category scoring breakdown',
          'Industry-specific compliance assessment',
          'Step-by-step market entry roadmap',
          'Risk analysis and mitigation strategies',
          'Financial readiness evaluation',
          'Regulatory compliance checklist'
        ];
      case 'partner-recommendations':
        return [
          'AI-matched verified partners based on your analysis',
          'Priority recommendations for critical needs',
          'Direct contact information and introductions',
          'Category-specific partner expertise',
          'Success stories and case studies',
          'Negotiated member rates with partners'
        ];
      case 'advanced-reports':
        return [
          'Professional PDF reports for stakeholders',
          'Executive summary and detailed breakdowns',
          'Custom branding and company information',
          'Historical analysis comparison',
          'Progress tracking and milestone updates',
          'Export to multiple formats'
        ];
      default:
        return [];
    }
  };

  if (showPricing) {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={() => setShowPricing(false)}
          className="mb-4"
        >
          ← Back to Analysis
        </Button>
        <PricingSection />
      </div>
    );
  }

  return (
    <Card className="relative overflow-hidden">
      {/* Premium Badge */}
      <div className="absolute top-4 right-4">
        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
          <Crown className="h-3 w-3 mr-1" />
          Premium
        </Badge>
      </div>

      {/* Lock Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 backdrop-blur-[1px]" />
      
      <div className="relative">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-primary/10 rounded-full">
              {getFeatureIcon()}
            </div>
          </div>
          <CardTitle className="text-xl mb-2 flex items-center justify-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            {title}
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            {description}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Current Analysis Context */}
          {currentAnalysis && (
            <div className="p-4 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h4 className="font-medium">Your Analysis Ready for Enhancement</h4>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Company: <span className="font-medium">{currentAnalysis.companyName}</span></p>
                <p>• Industry: <span className="font-medium">{currentAnalysis.industry}</span></p>
                <p>• Current Score: <span className="font-medium text-primary">{currentAnalysis.overallScore}%</span></p>
              </div>
            </div>
          )}

          {/* Feature Benefits */}
          <div className="space-y-3">
            <h4 className="font-semibold text-center mb-4 flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              What You'll Get
            </h4>
            <div className="grid gap-2">
              {getFeatureBenefits().map((benefit, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Value Proposition */}
          <div className="p-4 bg-gradient-to-r from-success/10 to-blue-100 rounded-lg border border-success/20">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl">💡</span>
                <h4 className="font-semibold text-success">Member Value</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Access professional-grade business intelligence that typically costs £2,000+ from consultants
              </p>
              <div className="flex items-center justify-center gap-4 text-xs">
                <span className="line-through text-muted-foreground">£2,000+ consultant fee</span>
                <ArrowRight className="h-3 w-3" />
                <span className="font-bold text-success">£29/month member price</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={() => setShowPricing(true)}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
              size="lg"
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Premium
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowPricing(true)}
              >
                View Pricing
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onUpgrade}
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="text-center text-xs text-muted-foreground space-y-1">
            <p>✓ 30-day money-back guarantee</p>
            <p>✓ Cancel anytime, no contracts</p>
            <p>✓ Used by 500+ UK market entrants</p>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}