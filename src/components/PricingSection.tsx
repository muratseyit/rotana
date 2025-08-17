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

const pricingTiers: PricingTier[] = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "Perfect for exploring UK market opportunities",
    features: [
      "1 business analysis per month",
      "Basic market readiness score",
      "Access to partner directory",
      "Standard compliance checklist",
      "Email support"
    ],
    stripePriceId: ""
  },
  {
    name: "Professional",
    price: "£29",
    period: "/month",
    description: "For serious entrepreneurs entering the UK market",
    features: [
      "10 business analyses per month",
      "Advanced marketability insights",
      "Priority partner matching",
      "Detailed compliance roadmap",
      "Financial metrics tracking",
      "Phone & email support",
      "Industry benchmarking"
    ],
    isPopular: true,
    stripePriceId: "price_professional_monthly"
  },
  {
    name: "Enterprise",
    price: "£99",
    period: "/month",
    description: "For agencies and consultants with multiple clients",
    features: [
      "Unlimited business analyses",
      "White-label reports",
      "API access",
      "Custom compliance templates",
      "Dedicated account manager",
      "24/7 priority support",
      "Advanced analytics dashboard",
      "Multi-user team access",
      "Custom integrations"
    ],
    isPremium: true,
    stripePriceId: "price_enterprise_monthly"
  }
];

interface PricingSectionProps {
  onSubscribe?: (priceId: string) => void;
  currentPlan?: string;
}

export function PricingSection({ onSubscribe, currentPlan }: PricingSectionProps) {
  return (
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Choose Your Growth Plan
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Scale your UK market entry with plans designed for every stage of your journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingTiers.map((tier, index) => (
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
              {tier.isPopular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-premium text-premium-foreground">
                  <Crown className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              )}
              
              {tier.isPremium && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-background text-foreground">
                  <Zap className="w-3 h-3 mr-1" />
                  Enterprise
                </Badge>
              )}

              <CardHeader className="text-center">
                <CardTitle className="text-xl">{tier.name}</CardTitle>
                <CardDescription className={tier.isPremium ? 'text-premium-foreground/80' : ''}>
                  {tier.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className={`text-sm ${tier.isPremium ? 'text-premium-foreground/70' : 'text-muted-foreground'}`}>
                    {tier.period}
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
                    tier.name === "Starter" 
                      ? 'variant-outline' 
                      : tier.isPremium
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
                    : tier.name === "Starter" 
                    ? 'Get Started Free' 
                    : `Upgrade to ${tier.name}`
                  }
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            All plans include 14-day free trial • No setup fees • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}