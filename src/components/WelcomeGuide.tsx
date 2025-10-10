import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  Target, 
  Shield, 
  TrendingUp, 
  Users, 
  CheckCircle,
  ArrowRight,
  PlusCircle
} from "lucide-react";

interface WelcomeGuideProps {
  onAddBusiness: () => void;
  onClose: () => void;
}

export function WelcomeGuide({ onAddBusiness, onClose }: WelcomeGuideProps) {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Get comprehensive market readiness assessment using advanced AI",
      color: "text-primary"
    },
    {
      icon: Target,
      title: "UK Market Insights",
      description: "Detailed analysis of your product-market fit for the UK",
      color: "text-secondary"
    },
    {
      icon: Shield,
      title: "Compliance Check",
      description: "Automated regulatory and compliance assessment",
      color: "text-accent"
    },
    {
      icon: TrendingUp,
      title: "Growth Strategy",
      description: "Scalability and expansion recommendations",
      color: "text-primary"
    },
    {
      icon: Users,
      title: "Partner Network",
      description: "Connect with verified UK business partners",
      color: "text-secondary"
    }
  ];

  const steps = [
    {
      step: 1,
      title: "Add Your Business",
      description: "Provide basic information about your company and industry"
    },
    {
      step: 2,
      title: "AI Analysis",
      description: "Our system analyzes your market readiness across multiple dimensions"
    },
    {
      step: 3,
      title: "Get Insights",
      description: "Receive detailed reports with actionable recommendations"
    },
    {
      step: 4,
      title: "Connect Partners",
      description: "Find and connect with relevant UK business partners"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 border-primary/20">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="inline-flex p-4 rounded-full bg-gradient-primary/20 mb-4">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-3 bg-gradient-primary bg-clip-text text-transparent">
              Welcome to Converta
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your AI-powered gateway to the UK market. Get comprehensive assessments, compliance insights, 
              and connect with verified partners to accelerate your UK expansion.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={onAddBusiness} size="lg" className="gap-2">
              <PlusCircle className="h-5 w-5" />
              Add Your First Business
            </Button>
            <Button variant="outline" size="lg" onClick={onClose}>
              Skip for Now
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Platform Features
            </CardTitle>
            <CardDescription>
              Everything you need for successful UK market entry
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Icon className={`h-4 w-4 ${feature.color}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-secondary" />
              How It Works
            </CardTitle>
            <CardDescription>
              Simple 4-step process to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  {step.step}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{step.title}</h4>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground mt-2" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* CTA Section */}
      <Card className="border-primary/20">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-semibold mb-2">Ready to get started?</h3>
          <p className="text-muted-foreground mb-4">
            Add your business details and get your UK market readiness assessment in minutes.
          </p>
          <Button onClick={onAddBusiness} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Your Business Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}