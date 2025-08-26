import { Check, Crown, Zap } from "lucide-react";
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
  const renderPricingCard = (tier: PricingTier, showBadge: boolean = true) => (
    <Card 
      key={tier.name} 
      className={`relative ${
        tier.isPopular 
          ? 'border-premium shadow-lg scale-105' 
          : tier.isPremium
          ? 'bg-gradient-premium text-premium-foreground border-premium'
          : ''
      }`}
    >
      {showBadge && tier.isPopular && (
        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-premium text-premium-foreground">
          <Crown className="w-3 h-3 mr-1" />
          Most Popular
        </Badge>
      )}
      
      {showBadge && tier.isPremium && (
        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-background text-foreground">
          <Zap className="w-3 h-3 mr-1" />
          Best Value
        </Badge>
      )}

      <CardHeader className="text-center">
        <CardTitle className="text-xl">{tier.name}</CardTitle>
        <CardDescription className={tier.isPremium ? 'text-premium-foreground/80' : ''}>
          {tier.description}
        </CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-bold">{tier.price}</span>
          <span className={`text-sm ml-1 ${tier.isPremium ? 'text-premium-foreground/70' : 'text-muted-foreground'}`}>
            {tier.period && `/${tier.period}`}
          </span>
        </div>
      </CardHeader>

      <CardContent>
        <ul className="space-y-3">
          {tier.features.map((feature, featureIndex) => (
            <li key={featureIndex} className="flex items-start gap-2">
              <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                tier.isPremium ? 'text-premium-foreground' : 'text-success'
              }`} />
              <span className={`text-sm ${
                tier.isPremium ? 'text-premium-foreground/90' : 'text-foreground'
              }`}>
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button 
          className={`w-full ${
            tier.isPremium
              ? 'bg-background text-foreground hover:bg-background/90'
              : tier.isPopular
              ? 'bg-premium text-premium-foreground hover:bg-premium/90'
              : ''
          }`}
          onClick={() => tier.stripePriceId && onSubscribe?.(tier.stripePriceId)}
          disabled={currentPlan === tier.name.toLowerCase()}
        >
          {currentPlan === tier.name.toLowerCase() 
            ? 'Current Plan' 
            : tier.name === "AI Business Analysis"
            ? 'Get Analysis Report'
            : 'Choose This Plan'
          }
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Two pathways to UK market success - for businesses seeking analysis and partners offering services
          </p>
        </div>

        {/* SME Analysis Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold mb-4">For Small & Medium Enterprises</h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Get comprehensive UK market analysis and immediate access to our partner network
            </p>
          </div>
          
          <div className="flex justify-center">
            <div className="max-w-sm">
              {renderPricingCard(smeAnalysis, false)}
            </div>
          </div>
        </div>

        {/* Partner Listing Section */}
        <div>
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold mb-4">For Service Partners</h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Join our partner network and connect with businesses entering the UK market
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {partnerListingTiers.map((tier) => renderPricingCard(tier))}
          </div>
          
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              All partner plans include 10% commission on successful matches • No hidden fees
            </p>
          </div>
        </div>

        <div className="text-center mt-16 p-8 bg-muted/50 rounded-lg">
          <h4 className="text-lg font-semibold mb-2">How it works</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-sm text-muted-foreground">
            <div>
              <strong className="text-foreground">For SMEs:</strong> Pay £8 once to get your comprehensive analysis report, 
              then access our partner directory and begin receiving services immediately.
            </div>
            <div>
              <strong className="text-foreground">For Partners:</strong> Choose your listing period to join our directory, 
              then earn from successful client matches with our 10% commission structure.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}