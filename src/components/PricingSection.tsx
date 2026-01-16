import { Check, Crown, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  isPremium?: boolean;
  stripePriceId?: string;
}

const smeAnalysis: PricingTier = {
  name: "AI Business Analysis",
  price: "£8",
  period: "one-time",
  description: "Get comprehensive UK market analysis for your business",
  features: [
    "Complete marketability assessment",
    "Detailed compliance roadmap",
    "Financial readiness evaluation",
    "Industry-specific insights",
    "Partner matching recommendations",
    "Full access to partner directory",
    "Begin receiving services immediately"
  ],
  isPopular: true,
  stripePriceId: "price_ai_analysis_8gbp"
};

const partnerListingTiers: PricingTier[] = [
  {
    name: "3 Months",
    price: "£25",
    period: "3 months",
    description: "Get started with short-term visibility",
    features: [
      "Listed in partner directory",
      "Client matching opportunities",
      "Basic profile customization",
      "Email notifications",
      "10% commission on matches"
    ],
    stripePriceId: "price_partner_3months_25gbp"
  },
  {
    name: "6 Months", 
    price: "£40",
    period: "6 months",
    description: "Popular choice for growing businesses",
    features: [
      "Listed in partner directory",
      "Priority in search results",
      "Enhanced profile features",
      "Client matching opportunities",
      "Email & SMS notifications",
      "10% commission on matches"
    ],
    isPopular: true,
    stripePriceId: "price_partner_6months_40gbp"
  },
  {
    name: "1 Year",
    price: "£65", 
    period: "12 months",
    description: "Best value for established partners",
    features: [
      "Listed in partner directory",
      "Top priority in search results",
      "Premium profile features",
      "Advanced client matching",
      "Multi-channel notifications",
      "Analytics dashboard",
      "10% commission on matches"
    ],
    stripePriceId: "price_partner_12months_65gbp"
  },
  {
    name: "2 Years",
    price: "£95",
    period: "24 months", 
    description: "Maximum exposure and savings",
    features: [
      "Listed in partner directory",
      "Featured partner status",
      "Premium profile with media",
      "Priority client matching",
      "Dedicated account support",
      "Advanced analytics",
      "Custom integration options",
      "10% commission on matches"
    ],
    isPremium: true,
    stripePriceId: "price_partner_24months_95gbp"
  }
];

interface PricingSectionProps {
  onSubscribe?: (priceId: string) => void;
  currentPlan?: string;
}

export function PricingSection({ onSubscribe, currentPlan }: PricingSectionProps) {
  const renderPricingCard = (tier: PricingTier, showBadge: boolean = true, featured: boolean = false) => (
    <Card 
      key={tier.name} 
      className={`relative transition-all duration-300 hover:shadow-xl ${
        tier.isPopular 
          ? 'border-primary/50 shadow-lg ring-2 ring-primary/20 scale-[1.02]' 
          : tier.isPremium
          ? 'bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground border-primary'
          : 'border-border/50 hover:border-primary/30'
      } ${featured ? 'lg:scale-105' : ''}`}
    >
      {showBadge && tier.isPopular && (
        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground shadow-md px-3 py-1">
          <Crown className="w-3 h-3 mr-1" />
          Most Popular
        </Badge>
      )}
      
      {showBadge && tier.isPremium && (
        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-background text-foreground shadow-md px-3 py-1">
          <Zap className="w-3 h-3 mr-1" />
          Best Value
        </Badge>
      )}

      <CardHeader className="text-center pb-2">
        <CardTitle className={`text-xl ${tier.isPremium ? 'text-primary-foreground' : 'text-foreground'}`}>
          {tier.name}
        </CardTitle>
        <CardDescription className={tier.isPremium ? 'text-primary-foreground/80' : 'text-muted-foreground'}>
          {tier.description}
        </CardDescription>
        <div className="mt-4 pt-4 border-t border-border/20">
          <span className={`text-4xl font-bold ${tier.isPremium ? 'text-primary-foreground' : 'text-foreground'}`}>
            {tier.price}
          </span>
          <span className={`text-sm ml-1 ${tier.isPremium ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
            {tier.period && `/${tier.period}`}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <ul className="space-y-3">
          {tier.features.map((feature, featureIndex) => (
            <li key={featureIndex} className="flex items-start gap-2.5">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                tier.isPremium ? 'bg-primary-foreground/20' : 'bg-success/10'
              }`}>
                <Check className={`w-3 h-3 ${
                  tier.isPremium ? 'text-primary-foreground' : 'text-success'
                }`} />
              </div>
              <span className={`text-sm ${
                tier.isPremium ? 'text-primary-foreground/90' : 'text-muted-foreground'
              }`}>
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="pt-4">
        <Button 
          className={`w-full gap-2 ${
            tier.isPremium
              ? 'bg-background text-foreground hover:bg-background/90'
              : tier.isPopular
              ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md'
              : ''
          }`}
          variant={tier.isPopular || tier.isPremium ? 'default' : 'outline'}
          onClick={() => tier.stripePriceId && onSubscribe?.(tier.stripePriceId)}
          disabled={currentPlan === tier.name.toLowerCase()}
        >
          {currentPlan === tier.name.toLowerCase() 
            ? 'Current Plan' 
            : tier.name === "AI Business Analysis"
            ? 'Get Analysis Report'
            : 'Choose This Plan'
          }
          {currentPlan !== tier.name.toLowerCase() && <ArrowRight className="w-4 h-4" />}
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <section className="py-16 px-4 bg-card">
      <div className="container mx-auto max-w-7xl">
        {/* SME Analysis Section */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <Badge className="bg-primary/10 text-primary mb-3">For SMEs</Badge>
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">For Small & Medium Enterprises</h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Get comprehensive UK market analysis and immediate access to our partner network
            </p>
          </div>
          
          <div className="flex justify-center">
            <div className="max-w-md w-full">
              {renderPricingCard(smeAnalysis, false, true)}
            </div>
          </div>
        </div>

        {/* Partner Listing Section */}
        <div>
          <div className="text-center mb-10">
            <Badge className="bg-success/10 text-success mb-3">For Partners</Badge>
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">For Service Partners</h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Join our partner network and connect with businesses entering the UK market
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {partnerListingTiers.map((tier) => renderPricingCard(tier))}
          </div>
          
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground bg-muted/50 inline-block px-4 py-2 rounded-full">
              All partner plans include 10% commission on successful matches • No hidden fees
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-16 p-8 bg-muted/30 rounded-2xl border border-border/50">
          <h4 className="text-lg font-semibold text-foreground text-center mb-6">How it works</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">1</span>
              </div>
              <div>
                <strong className="text-foreground block mb-1">For SMEs:</strong>
                <p className="text-sm text-muted-foreground">
                  Pay £8 once to get your comprehensive analysis report, then access our partner directory and begin receiving services immediately.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-success">2</span>
              </div>
              <div>
                <strong className="text-foreground block mb-1">For Partners:</strong>
                <p className="text-sm text-muted-foreground">
                  Choose your listing period to join our directory, then earn from successful client matches with our 10% commission structure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
