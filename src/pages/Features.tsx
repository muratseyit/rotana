import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, FileText, Users, Zap, CheckCircle, Globe, TrendingUp, Shield, Clock, Target, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { MobileNavigation } from "@/components/MobileNavigation";
import { FadeUp, SlideInLeft, SlideInRight, StaggerContainer, StaggerItem, ScaleUp } from "@/components/ScrollAnimations";

const Features = () => {
  const navigate = useNavigate();
  const [isSchedulingDemo, setIsSchedulingDemo] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleScheduleDemo = () => {
    setIsSchedulingDemo(true);

    setTimeout(() => {
      setIsSchedulingDemo(false);
      toast({
        title: "Demo Scheduled!",
        description: "We'll contact you within 24 hours to schedule your personalized demo.",
      });
    }, 2000);
  };

  const features = [
    {
      icon: BarChart3,
      title: t('features.aiAnalysisTitle'),
      description: t('features.aiAnalysisDesc'),
      items: [
        t('features.aiAnalysis1'),
        t('features.aiAnalysis2'),
        t('features.aiAnalysis3'),
        t('features.aiAnalysis4'),
      ],
      gradient: "from-primary/10 to-primary/5",
      iconBg: "bg-primary/10",
      iconColor: "text-primary"
    },
    {
      icon: Users,
      title: t('features.partnerNetworkTitle'),
      description: t('features.partnerNetworkDesc'),
      items: [
        t('features.partnerNetwork1'),
        t('features.partnerNetwork2'),
        t('features.partnerNetwork3'),
        t('features.partnerNetwork4'),
      ],
      gradient: "from-success/10 to-success/5",
      iconBg: "bg-success/10",
      iconColor: "text-success"
    },
    {
      icon: FileText,
      title: t('features.complianceTitle'),
      description: t('features.complianceDesc'),
      items: [
        t('features.compliance1'),
        t('features.compliance2'),
        t('features.compliance3'),
        t('features.compliance4'),
      ],
      gradient: "from-accent/10 to-accent/5",
      iconBg: "bg-accent/10",
      iconColor: "text-accent-foreground"
    },
    {
      icon: Target,
      title: t('features.roadmapTitle'),
      description: t('features.roadmapDesc'),
      items: [
        t('features.roadmap1'),
        t('features.roadmap2'),
        t('features.roadmap3'),
        t('features.roadmap4'),
      ],
      gradient: "from-secondary/20 to-secondary/10",
      iconBg: "bg-secondary",
      iconColor: "text-secondary-foreground"
    },
    {
      icon: TrendingUp,
      title: t('features.analyticsTitle'),
      description: t('features.analyticsDesc'),
      items: [
        t('features.analytics1'),
        t('features.analytics2'),
        t('features.analytics3'),
        t('features.analytics4'),
      ],
      gradient: "from-primary/10 to-primary/5",
      iconBg: "bg-primary/10",
      iconColor: "text-primary"
    },
    {
      icon: Shield,
      title: t('features.securityTitle'),
      description: t('features.securityDesc'),
      items: [
        t('features.security1'),
        t('features.security2'),
        t('features.security3'),
        t('features.security4'),
      ],
      gradient: "from-success/10 to-success/5",
      iconBg: "bg-success/10",
      iconColor: "text-success"
    },
  ];

  const benefits = [
    {
      icon: Clock,
      title: t('features.saveTime'),
      description: t('features.saveTimeDesc'),
      color: "bg-primary"
    },
    {
      icon: Award,
      title: t('features.expertLevel'),
      description: t('features.expertLevelDesc'),
      color: "bg-success"
    },
    {
      icon: Globe,
      title: t('features.globalScale'),
      description: t('features.globalScaleDesc'),
      color: "bg-accent"
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
                <BarChart3 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">Converta</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
              <Link to="/features" className="text-foreground font-medium">Features</Link>
              <Link to="/partners" className="text-muted-foreground hover:text-foreground transition-colors">Partners</Link>
              <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => navigate('/guest-analysis')} className="hidden md:inline-flex">
                {t('nav.getStarted')}
              </Button>
              <MobileNavigation />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-muted/50 via-background to-muted/30" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <FadeUp>
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary mb-6 shadow-sm">
              <Zap className="h-4 w-4 mr-2" />
              {t('features.badge')}
            </span>
          </FadeUp>
          
          <FadeUp delay={0.1}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              {t('features.heroTitle')}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-success">{t('features.heroTitleHighlight')}</span>
            </h1>
          </FadeUp>
          
          <FadeUp delay={0.2}>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
              {t('features.heroDesc')}
            </p>
          </FadeUp>
          
          <FadeUp delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/guest-analysis">
                <Button size="lg" variant="premium" className="px-8 py-6 text-lg shadow-lg hover:shadow-xl">
                  {t('features.startAnalysis')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-6 text-lg"
                onClick={handleScheduleDemo}
                disabled={isSchedulingDemo}
              >
                {isSchedulingDemo ? t('features.scheduling') : t('features.scheduleDemo')}
              </Button>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-7xl mx-auto">
          <FadeUp className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('features.coreTitle')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('features.coreSubtitle')}
            </p>
          </FadeUp>

          <StaggerContainer staggerDelay={0.1} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <StaggerItem key={index}>
                <Card 
                  className={`group relative overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg bg-gradient-to-br ${feature.gradient} h-full`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <CardHeader className="text-center pb-4">
                    <div className={`w-14 h-14 ${feature.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className={`h-7 w-7 ${feature.iconColor}`} />
                    </div>
                    <CardTitle className="text-lg mb-2">{feature.title}</CardTitle>
                    <CardDescription className="text-center text-sm">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2.5 text-sm text-muted-foreground">
                      {feature.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <FadeUp className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('features.whyChoose')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('features.whyChooseSubtitle')}
            </p>
          </FadeUp>

          <StaggerContainer staggerDelay={0.15} className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <StaggerItem key={index}>
                <div className="text-center group">
                  <div className={`w-20 h-20 ${benefit.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <benefit.icon className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">{benefit.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary via-primary to-primary/90">
        <div className="max-w-4xl mx-auto text-center">
          <FadeUp>
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
              {t('features.ctaTitle')}
            </h2>
          </FadeUp>
          <FadeUp delay={0.1}>
            <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              {t('features.ctaSubtitle')}
            </p>
          </FadeUp>
          <FadeUp delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/guest-analysis">
                <Button size="lg" className="bg-background text-foreground hover:bg-background/90 px-8 py-6 text-lg shadow-lg">
                  {t('features.startAnalysis')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 px-8 py-6 text-lg"
                onClick={handleScheduleDemo}
                disabled={isSchedulingDemo}
              >
                {isSchedulingDemo ? "Scheduling..." : "Schedule Consultation"}
              </Button>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
};

export default Features;
