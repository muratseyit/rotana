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
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-background/10 backdrop-blur-sm border border-background/20 mb-6 animate-fade-in-up">
                  <Sparkles className="h-4 w-4 mr-2 text-background/90" />
                  <span className="text-sm font-medium text-background/90">{t('hero.badge')}</span>
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-background mb-6 leading-tight animate-fade-in-up animate-delay-100">
                  {t('hero.title')}
                </h1>
                
                <p className="text-lg md:text-xl text-background/80 mb-8 max-w-xl leading-relaxed animate-fade-in-up animate-delay-200">
                  {t('hero.description')}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-fade-in-up animate-delay-300">
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

                {/* Trust badges */}
                <div className="animate-fade-in-up animate-delay-400">
                  <TrustBadges variant="dark" />
                </div>
              </div>

              {/* Right: Stats & Visual */}
              <div className="hidden lg:block animate-slide-in-right">
                <div className="relative">
                  {/* Stats cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass-dark rounded-2xl p-6 backdrop-blur-xl border border-background/10 animate-float">
                      <div className="text-4xl font-bold text-background mb-2">
                        <AnimatedCounter end={500} suffix="+" />
                      </div>
                      <p className="text-background/70 text-sm">Businesses Analyzed</p>
                    </div>
                    <div className="glass-dark rounded-2xl p-6 backdrop-blur-xl border border-background/10 animate-float animate-delay-200">
                      <div className="text-4xl font-bold text-background mb-2">
                        <AnimatedCounter end={95} suffix="%" />
                      </div>
                      <p className="text-background/70 text-sm">Success Rate</p>
                    </div>
                    <div className="glass-dark rounded-2xl p-6 backdrop-blur-xl border border-background/10 animate-float animate-delay-100">
                      <div className="text-4xl font-bold text-background mb-2">£<AnimatedCounter end={2} suffix="M+" /></div>
                      <p className="text-background/70 text-sm">Trade Facilitated</p>
                    </div>
                    <div className="glass-dark rounded-2xl p-6 backdrop-blur-xl border border-background/10 animate-float animate-delay-300">
                      <div className="text-4xl font-bold text-background mb-2">
                        <AnimatedCounter end={50} suffix="+" />
                      </div>
                      <p className="text-background/70 text-sm">Verified Partners</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Comprehensive Analysis Highlight Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-secondary/50 to-background">
          <div className="max-w-6xl mx-auto">
            <Card className="border border-border/50 shadow-xl bg-card overflow-hidden">
              <CardContent className="p-0">
                <div className="grid lg:grid-cols-2">
                  {/* Left content */}
                  <div className="p-8 lg:p-12">
                    <div className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-success/10 text-success mb-6">
                      <Star className="h-3 w-3 mr-1.5 fill-success" />
                      {t('hero.mostPopularChoice')}
                    </div>
                    
                    <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 leading-tight">
                      {t('hero.comprehensiveTitle')}
                    </h2>
                    
                    <p className="text-muted-foreground mb-8 leading-relaxed text-lg">
                      {t('hero.comprehensiveDesc')}
                    </p>
                    
                    <div className="space-y-4 mb-8">
                      {[
                        { title: t('hero.realMetrics'), desc: t('hero.realMetricsDesc') },
                        { title: t('hero.advancedPartner'), desc: t('hero.advancedPartnerDesc') },
                        { title: t('hero.expertReview'), desc: t('hero.expertReviewDesc') },
                        { title: t('hero.ukRequirements'), desc: t('hero.ukRequirementsDesc') },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3 group">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 group-hover:bg-primary/20 transition-colors">
                            <CheckCircle className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{item.title}</p>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      size="lg" 
                      className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 group"
                      onClick={() => navigate('/comprehensive-analysis-form')}
                    >
                      {t('hero.startComprehensive')}
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                  
                  {/* Right: What you get */}
                  <div className="bg-gradient-to-br from-primary/5 via-accent/30 to-secondary p-8 lg:p-12 border-l border-border/50">
                    <h3 className="text-xl font-semibold text-foreground mb-6">{t('hero.whatYouGet')}</h3>
                    
                    <div className="space-y-4">
                      {[
                        { icon: BarChart3, text: t('hero.getItem1') },
                        { icon: FileText, text: t('hero.getItem2') },
                        { icon: Users, text: t('hero.getItem3') },
                        { icon: Globe, text: t('hero.getItem4') },
                        { icon: TrendingUp, text: t('hero.getItem5') },
                        { icon: CheckCircle, text: t('hero.getItem6') },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-background/50 hover:bg-background/80 transition-colors group">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                            <item.icon className="h-5 w-5 text-primary" />
                          </div>
                          <span className="text-sm font-medium text-foreground">{item.text}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-8 p-4 rounded-xl bg-background/60 border border-border/50">
                      <p className="text-sm text-muted-foreground text-center">
                        {t('hero.statsLine')}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {t('features.title')}
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t('features.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: BarChart3, title: t('features.aiScore'), desc: t('features.aiScoreDesc'), color: 'text-primary' },
                { icon: FileText, title: t('features.docGenerator'), desc: t('features.docGeneratorDesc'), color: 'text-success' },
                { icon: Users, title: t('features.partnerMatching'), desc: t('features.partnerMatchingDesc'), color: 'text-brand' },
                { icon: TrendingUp, title: t('features.smartRoadmap'), desc: t('features.smartRoadmapDesc'), color: 'text-success' },
              ].map((feature, i) => (
                <Card key={i} className="group card-hover border-border/50 bg-card hover:border-primary/30">
                  <CardHeader className="text-center pb-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-4 group-hover:from-primary/15 group-hover:to-primary/10 transition-colors`}>
                      <feature.icon className={`h-7 w-7 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-muted-foreground leading-relaxed">
                      {feature.desc}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-secondary/30 to-background">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {t('howItWorks.title')}
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t('howItWorks.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connecting line */}
              <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />
              
              {[
                { step: "1", title: t('howItWorks.step1'), desc: t('howItWorks.step1Desc'), color: 'bg-primary' },
                { step: "2", title: t('howItWorks.step2'), desc: t('howItWorks.step2Desc'), color: 'bg-success' },
                { step: "3", title: t('howItWorks.step3'), desc: t('howItWorks.step3Desc'), color: 'bg-brand' },
              ].map((item, i) => (
                <div key={i} className="text-center relative animate-fade-in-up" style={{ animationDelay: `${i * 0.2}s` }}>
                  <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg relative z-10`}>
                    <span className="text-2xl font-bold text-primary-foreground">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-accent/10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                {t('testimonials.badge') || 'Success Stories'}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {t('testimonials.title') || 'Trusted by Turkish Businesses'}
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t('testimonials.subtitle') || 'See how we\'ve helped companies expand into the UK market'}
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <TestimonialCard
                quote="Converta's analysis helped us understand exactly what we needed for UK compliance. We launched 3 months ahead of schedule."
                author="Mehmet Yılmaz"
                role="CEO"
                company="TechExport TR"
                rating={5}
              />
              <TestimonialCard
                quote="The partner matching feature connected us with the perfect accounting firm. They understood both Turkish and UK regulations."
                author="Ayşe Kaya"
                role="Founder"
                company="Organic Foods Istanbul"
                rating={5}
              />
              <TestimonialCard
                quote="We saved over £15,000 in consulting fees by using Converta's automated compliance checklist and market analysis."
                author="Can Demir"
                role="Operations Director"
                company="Anatolian Textiles"
                rating={5}
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-accent/20 to-background">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {t('cta.title')}
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t('cta.description')}
              </p>
            </div>
            <LeadCaptureForm 
              variant="hero"
              title={t('cta.leadFormTitle')}
              description={t('cta.leadFormDesc')}
            />
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gradient-to-b from-foreground to-foreground/95 text-background/70 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Newsletter Section */}
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
            
            <div className="border-t border-background/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-background/50">
                © {new Date().getFullYear()} Converta. All rights reserved.
              </p>
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
          </div>
        </footer>
      </div>
    </>
  );
};

export default Index;