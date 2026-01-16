import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BarChart3, FileText, Users, Zap, CheckCircle, Globe, TrendingUp, Shield, Building2, Star, Sparkles, Linkedin, Twitter } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { MobileNavigation } from "@/components/MobileNavigation";
import { SEOHead } from "@/components/SEOHead";
import { LeadCaptureForm } from "@/components/LeadCaptureForm";
import { TrustBadges } from "@/components/TrustBadges";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { TestimonialCard } from "@/components/TestimonialCard";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { StatsBar } from "@/components/StatsBar";
import { CollaborationBadge } from "@/components/CollaborationBadge";
import { FadeUp, FadeIn, SlideInLeft, SlideInRight, StaggerContainer, StaggerItem, ScaleUp } from "@/components/ScrollAnimations";
import { trackFunnel, trackTimeOnPage, trackScrollDepth } from "@/utils/analytics";

const Index = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    trackFunnel('landing');
    const trackTime = trackTimeOnPage('index');
    const trackScroll = trackScrollDepth('index');

    return () => {
      trackTime();
      trackScroll();
    };
  }, []);

  return (
    <>
      <SEOHead 
        title="Converta - AI-Powered UK Market Entry for Turkish SMEs"
        description="Transform your Turkish SME's UK market entry with AI-powered business analysis. Get comprehensive insights, connect with verified partners, and accelerate your growth in the UK market."
        keywords="UK market entry, Turkish SME, AI business analysis, UK incorporation, business partners, market analysis, SME expansion, UK business setup"
      />
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="glass border-b border-border/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
                  <BarChart3 className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-2xl font-semibold text-foreground tracking-tight">Converta</span>
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={() => navigate('/features')}>
                  {t('nav.features')}
                </Button>
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={() => navigate('/partners')}>
                  {t('nav.partners')}
                </Button>
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={() => navigate('/pricing')}>
                  {t('nav.pricing')}
                </Button>
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground text-xs" onClick={() => navigate('/admin')}>
                  {t('nav.admin')}
                </Button>
                <div className="w-px h-6 bg-border mx-2" />
                <LanguageSwitcher />
                <Button className="ml-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md" onClick={() => navigate('/comprehensive-analysis-form')}>
                  {t('hero.getComprehensive')}
                </Button>
              </div>

              <MobileNavigation />
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-hero opacity-95" />
          
          {/* Decorative elements */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand/10 rounded-full blur-3xl animate-pulse-soft animate-delay-300" />
          
          <div className="relative max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Content */}
              <div className="text-left">
                <FadeUp delay={0}>
                  <CollaborationBadge variant="hero" className="mb-6" />
                </FadeUp>
                
                <FadeUp delay={0.05}>
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-background/10 backdrop-blur-sm border border-background/20 mb-6">
                    <Sparkles className="h-4 w-4 mr-2 text-background/90" />
                    <span className="text-sm font-medium text-background/90">{t('hero.badge')}</span>
                  </div>
                </FadeUp>
                
                <FadeUp delay={0.1}>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-background mb-6 leading-tight">
                    {t('hero.title')}
                  </h1>
                </FadeUp>
                
                <FadeUp delay={0.2}>
                  <p className="text-lg md:text-xl text-background/80 mb-8 max-w-xl leading-relaxed">
                    {t('hero.description')}
                  </p>
                </FadeUp>
                
                <FadeUp delay={0.3}>
                  <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <Button 
                      size="lg" 
                      className="bg-background text-primary hover:bg-background/95 shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-6 text-lg font-semibold group"
                      onClick={() => navigate('/comprehensive-analysis-form')}
                    >
                      {t('hero.getComprehensive')}
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="bg-transparent border-2 border-background/40 text-background hover:bg-background/10 hover:border-background/60 transition-all duration-300 px-8 py-6 text-lg"
                      onClick={() => navigate('/guest-analysis')}
                    >
                      {t('hero.tryQuickAnalysis')}
                    </Button>
                  </div>
                </FadeUp>

                {/* Trust badges */}
                <FadeUp delay={0.4}>
                  <TrustBadges variant="dark" />
                </FadeUp>
              </div>

              {/* Right: Stats & Visual */}
              <SlideInRight className="hidden lg:block" delay={0.3}>
                <div className="relative">
                  {/* Stats cards */}
                  <StaggerContainer staggerDelay={0.1} className="grid grid-cols-2 gap-4">
                    <StaggerItem>
                      <div className="glass-dark rounded-2xl p-6 backdrop-blur-xl border border-background/10 hover:scale-105 transition-transform duration-300">
                        <div className="text-4xl font-bold text-background mb-2">
                          <AnimatedCounter end={500} suffix="+" />
                        </div>
                        <p className="text-background/70 text-sm">Businesses Analyzed</p>
                      </div>
                    </StaggerItem>
                    <StaggerItem>
                      <div className="glass-dark rounded-2xl p-6 backdrop-blur-xl border border-background/10 hover:scale-105 transition-transform duration-300">
                        <div className="text-4xl font-bold text-background mb-2">
                          <AnimatedCounter end={95} suffix="%" />
                        </div>
                        <p className="text-background/70 text-sm">Success Rate</p>
                      </div>
                    </StaggerItem>
                    <StaggerItem>
                      <div className="glass-dark rounded-2xl p-6 backdrop-blur-xl border border-background/10 hover:scale-105 transition-transform duration-300">
                        <div className="text-4xl font-bold text-background mb-2">£<AnimatedCounter end={2} suffix="M+" /></div>
                        <p className="text-background/70 text-sm">Trade Facilitated</p>
                      </div>
                    </StaggerItem>
                    <StaggerItem>
                      <div className="glass-dark rounded-2xl p-6 backdrop-blur-xl border border-background/10 hover:scale-105 transition-transform duration-300">
                        <div className="text-4xl font-bold text-background mb-2">
                          <AnimatedCounter end={50} suffix="+" />
                        </div>
                        <p className="text-background/70 text-sm">Verified Partners</p>
                      </div>
                    </StaggerItem>
                  </StaggerContainer>
                </div>
              </SlideInRight>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <StatsBar />

        {/* Comprehensive Analysis Highlight Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-secondary/50 to-background">
          <div className="max-w-6xl mx-auto">
            <ScaleUp>
              <Card className="border border-border/50 shadow-xl bg-card overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid lg:grid-cols-2">
                    {/* Left content */}
                    <div className="p-8 lg:p-12">
                      <FadeUp delay={0.1}>
                        <div className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-success/10 text-success mb-6">
                          <Star className="h-3 w-3 mr-1.5 fill-success" />
                          {t('hero.mostPopularChoice')}
                        </div>
                      </FadeUp>
                      
                      <FadeUp delay={0.2}>
                        <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 leading-tight">
                          {t('hero.comprehensiveTitle')}
                        </h2>
                      </FadeUp>
                      
                      <FadeUp delay={0.3}>
                        <p className="text-muted-foreground mb-8 leading-relaxed text-lg">
                          {t('hero.comprehensiveDesc')}
                        </p>
                      </FadeUp>
                      
                      <StaggerContainer staggerDelay={0.1} className="space-y-4 mb-8">
                        {[
                          { title: t('hero.realMetrics'), desc: t('hero.realMetricsDesc') },
                          { title: t('hero.advancedPartner'), desc: t('hero.advancedPartnerDesc') },
                          { title: t('hero.expertReview'), desc: t('hero.expertReviewDesc') },
                          { title: t('hero.ukRequirements'), desc: t('hero.ukRequirementsDesc') },
                        ].map((item, i) => (
                          <StaggerItem key={i}>
                            <div className="flex items-start gap-3 group">
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 group-hover:bg-primary/20 transition-colors">
                                <CheckCircle className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{item.title}</p>
                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                              </div>
                            </div>
                          </StaggerItem>
                        ))}
                      </StaggerContainer>
                      
                      <FadeUp delay={0.5}>
                        <Button 
                          size="lg" 
                          className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 group"
                          onClick={() => navigate('/comprehensive-analysis-form')}
                        >
                          {t('hero.startComprehensive')}
                          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </FadeUp>
                    </div>
                    
                    {/* Right: What you get */}
                    <div className="bg-gradient-to-br from-primary/5 via-accent/30 to-secondary p-8 lg:p-12 border-l border-border/50">
                      <FadeUp delay={0.2}>
                        <h3 className="text-xl font-semibold text-foreground mb-6">{t('hero.whatYouGet')}</h3>
                      </FadeUp>
                      
                      <StaggerContainer staggerDelay={0.1} className="space-y-4">
                        {[
                          { icon: BarChart3, text: t('hero.getItem1') },
                          { icon: FileText, text: t('hero.getItem2') },
                          { icon: Users, text: t('hero.getItem3') },
                          { icon: Globe, text: t('hero.getItem4') },
                          { icon: TrendingUp, text: t('hero.getItem5') },
                          { icon: CheckCircle, text: t('hero.getItem6') },
                        ].map((item, i) => (
                          <StaggerItem key={i}>
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-background/50 hover:bg-background/80 transition-colors group">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                                <item.icon className="h-5 w-5 text-primary" />
                              </div>
                              <span className="text-sm font-medium text-foreground">{item.text}</span>
                            </div>
                          </StaggerItem>
                        ))}
                      </StaggerContainer>
                      
                      <FadeUp delay={0.6}>
                        <div className="mt-8 p-4 rounded-xl bg-background/60 border border-border/50">
                          <p className="text-sm text-muted-foreground text-center">
                            {t('hero.statsLine')}
                          </p>
                        </div>
                      </FadeUp>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ScaleUp>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background via-accent/5 to-background">
          <div className="max-w-7xl mx-auto">
            <FadeUp className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                {t('features.badge') || 'Platform Features'}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {t('features.title')}
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t('features.subtitle')}
              </p>
            </FadeUp>

            <StaggerContainer staggerDelay={0.15} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: BarChart3, title: t('features.aiScore'), desc: t('features.aiScoreDesc'), gradient: 'from-primary/20 to-primary/5' },
                { icon: FileText, title: t('features.docGenerator'), desc: t('features.docGeneratorDesc'), gradient: 'from-success/20 to-success/5' },
                { icon: Users, title: t('features.partnerMatching'), desc: t('features.partnerMatchingDesc'), gradient: 'from-brand/20 to-brand/5' },
                { icon: TrendingUp, title: t('features.smartRoadmap'), desc: t('features.smartRoadmapDesc'), gradient: 'from-accent/40 to-accent/10' },
              ].map((feature, i) => (
                <StaggerItem key={i}>
                  <Card 
                    className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-xl transition-all duration-500 h-full"
                  >
                    {/* Gradient overlay on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    
                    <CardHeader className="text-center pb-4 relative z-10">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-background to-secondary flex items-center justify-center mx-auto mb-4 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                        <feature.icon className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <CardDescription className="text-center text-muted-foreground leading-relaxed">
                        {feature.desc}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-secondary/30 to-background overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <FadeUp className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                {t('howItWorks.badge') || 'Simple Process'}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {t('howItWorks.title')}
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t('howItWorks.subtitle')}
              </p>
            </FadeUp>

            <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
              {/* Connecting lines */}
              <div className="hidden md:block absolute top-20 left-[20%] right-[20%] h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <div className="hidden md:flex absolute top-20 left-[calc(33.33%-8px)] w-4 h-4 rounded-full bg-primary/30 border-2 border-primary/50 -translate-y-1.5" />
              <div className="hidden md:flex absolute top-20 left-[calc(66.66%-8px)] w-4 h-4 rounded-full bg-primary/30 border-2 border-primary/50 -translate-y-1.5" />
              
              {[
                { step: "1", title: t('howItWorks.step1'), desc: t('howItWorks.step1Desc'), icon: FileText, color: 'from-primary to-primary/80' },
                { step: "2", title: t('howItWorks.step2'), desc: t('howItWorks.step2Desc'), icon: BarChart3, color: 'from-success to-success/80' },
                { step: "3", title: t('howItWorks.step3'), desc: t('howItWorks.step3Desc'), icon: Users, color: 'from-brand to-brand/80' },
              ].map((item, i) => (
                <FadeUp key={i} delay={i * 0.2}>
                  <div className="text-center relative group">
                    {/* Step number badge */}
                    <div className="relative mx-auto mb-8">
                      <div className={`w-20 h-20 bg-gradient-to-br ${item.color} rounded-3xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300 relative z-10`}>
                        <item.icon className="h-10 w-10 text-primary-foreground" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-background border-2 border-border rounded-full flex items-center justify-center shadow-md z-20">
                        <span className="text-sm font-bold text-foreground">{item.step}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">
                      {item.desc}
                    </p>
                  </div>
                </FadeUp>
              ))}
            </div>

            {/* CTA below timeline */}
            <FadeUp delay={0.6} className="text-center mt-16">
              <Button 
                size="lg"
                onClick={() => navigate('/guest-analysis')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                {t('howItWorks.startNow') || 'Start Your Analysis'}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </FadeUp>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-accent/10">
          <div className="max-w-7xl mx-auto">
            <FadeUp className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                {t('testimonials.badge') || 'Success Stories'}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {t('testimonials.title') || 'Trusted by Turkish Businesses'}
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t('testimonials.subtitle') || 'See how we\'ve helped companies expand into the UK market'}
              </p>
            </FadeUp>
            
            <StaggerContainer staggerDelay={0.15} className="grid md:grid-cols-3 gap-8">
              <StaggerItem>
                <TestimonialCard
                  quote="Converta's analysis helped us understand exactly what we needed for UK compliance. We launched 3 months ahead of schedule."
                  author="Mehmet Yılmaz"
                  role="CEO"
                  company="TechExport TR"
                  rating={5}
                />
              </StaggerItem>
              <StaggerItem>
                <TestimonialCard
                  quote="The partner matching feature connected us with the perfect accounting firm. They understood both Turkish and UK regulations."
                  author="Ayşe Kaya"
                  role="Founder"
                  company="Organic Foods Istanbul"
                  rating={5}
                />
              </StaggerItem>
              <StaggerItem>
                <TestimonialCard
                  quote="We saved over £15,000 in consulting fees by using Converta's automated compliance checklist and market analysis."
                  author="Can Demir"
                  role="Operations Director"
                  company="Anatolian Textiles"
                  rating={5}
                />
              </StaggerItem>
            </StaggerContainer>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-accent/20 to-background">
          <div className="max-w-7xl mx-auto">
            <FadeUp className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {t('cta.title')}
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t('cta.description')}
              </p>
            </FadeUp>
            <ScaleUp delay={0.2}>
              <LeadCaptureForm 
                variant="hero"
                title={t('cta.leadFormTitle')}
                description={t('cta.leadFormDesc')}
              />
            </ScaleUp>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gradient-to-b from-foreground to-foreground/95 text-background/70 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Newsletter Section */}
            <FadeUp>
              <div className="bg-background/5 backdrop-blur-sm rounded-2xl p-8 mb-12 border border-background/10">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-xl font-semibold text-background mb-2">
                      {t('footer.newsletterTitle') || 'Stay Updated'}
                    </h3>
                    <p className="text-background/60 text-sm">
                      {t('footer.newsletterDesc') || 'Get the latest UK market insights and trade updates delivered to your inbox.'}
                    </p>
                  </div>
                  <NewsletterSignup variant="dark" />
                </div>
              </div>
            </FadeUp>

            <FadeIn delay={0.2}>
              <div className="grid md:grid-cols-4 gap-12">
                <div className="md:col-span-1">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-background" />
                    </div>
                    <span className="text-xl font-semibold text-background">Converta</span>
                  </div>
                  <p className="text-background/60 text-sm leading-relaxed mb-6">
                    {t('footer.description')}
                  </p>
                  <TrustBadges variant="dark" className="justify-start" />
                </div>
                
                <div>
                  <h4 className="text-background font-semibold mb-4">{t('footer.platform')}</h4>
                  <ul className="space-y-3">
                    <li><a href="#features" className="text-sm hover:text-background transition-colors">{t('footer.features')}</a></li>
                    <li><a href="#pricing" className="text-sm hover:text-background transition-colors" onClick={() => navigate('/pricing')}>{t('footer.pricing')}</a></li>
                    <li><a href="#partners" className="text-sm hover:text-background transition-colors" onClick={() => navigate('/partners')}>{t('footer.partners')}</a></li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-background font-semibold mb-4">{t('footer.support')}</h4>
                  <ul className="space-y-3">
                    <li><a href="#" className="text-sm hover:text-background transition-colors">Help Center</a></li>
                    <li><a href="#" className="text-sm hover:text-background transition-colors">Contact Us</a></li>
                    <li><a href="#" className="text-sm hover:text-background transition-colors">FAQs</a></li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-background font-semibold mb-4">{t('footer.legal')}</h4>
                  <ul className="space-y-3">
                    <li><a href="#" className="text-sm hover:text-background transition-colors">{t('footer.privacy')}</a></li>
                    <li><a href="#" className="text-sm hover:text-background transition-colors">{t('footer.terms')}</a></li>
                    <li><a href="#" className="text-sm hover:text-background transition-colors">Cookie Policy</a></li>
                  </ul>
                </div>
              </div>
            </FadeIn>
            
            <FadeIn delay={0.3}>
              <div className="border-t border-background/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <p className="text-sm text-background/50">
                    © {new Date().getFullYear()} Converta. All rights reserved.
                  </p>
                  {/* Turkey-UK Flags in footer */}
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-background/5 border border-background/10">
                    <svg className="w-4 h-3 rounded-[1px]" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">
                      <rect width="60" height="40" fill="#E30A17"/>
                      <circle cx="22.5" cy="20" r="10" fill="#fff"/>
                      <circle cx="25" cy="20" r="8" fill="#E30A17"/>
                      <polygon fill="#fff" points="38,20 32.5,22 33.5,17 29.5,14 35,13.5 38,9 41,13.5 46.5,14 42.5,17 43.5,22"/>
                    </svg>
                    <span className="text-[10px] text-background/40">↔</span>
                    <svg className="w-4 h-3 rounded-[1px]" viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
                      <rect width="60" height="30" fill="#012169"/>
                      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
                      <path d="M30,0 V30 M0,15 H60" stroke="#fff" strokeWidth="10"/>
                      <path d="M30,0 V30 M0,15 H60" stroke="#C8102E" strokeWidth="6"/>
                    </svg>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-background/50">
                    <Shield className="h-4 w-4" />
                    <span>GDPR & KVKK Compliant</span>
                  </div>
                  <div className="flex gap-3">
                    <a href="#" className="w-8 h-8 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors">
                      <Linkedin className="h-4 w-4 text-background/70" />
                    </a>
                    <a href="#" className="w-8 h-8 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors">
                      <Twitter className="h-4 w-4 text-background/70" />
                    </a>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Index;
