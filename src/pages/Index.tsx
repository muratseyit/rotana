import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BarChart3, FileText, Users, Zap, CheckCircle, Globe, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { MobileNavigation } from "@/components/MobileNavigation";
import { SEOHead } from "@/components/SEOHead";
import { LeadCaptureForm } from "@/components/LeadCaptureForm";
import { trackFunnel, trackTimeOnPage, trackScrollDepth } from "@/utils/analytics";

const Index = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    // Track landing page view
    trackFunnel('landing');
    const trackTime = trackTimeOnPage('index');
    const trackScroll = trackScrollDepth('index');

    return () => {
      trackTime();
      trackScroll();
    };
  }, []);

  const handleGetStarted = () => {
    navigate('/guest-analysis');
  };

  return (
    <>
      <SEOHead 
        title="Converta - AI-Powered UK Market Entry for Turkish SMEs"
        description="Transform your Turkish SME's UK market entry with AI-powered business analysis. Get comprehensive insights, connect with verified partners, and accelerate your growth in the UK market."
        keywords="UK market entry, Turkish SME, AI business analysis, UK incorporation, business partners, market analysis, SME expansion, UK business setup"
      />
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-brand" />
                <span className="text-2xl font-bold text-foreground">Converta</span>
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-6">
                <Button className="bg-transparent border border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors" onClick={() => navigate('/features')}>
                  {t('nav.features')}
                </Button>
                <Button className="bg-transparent border border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors" onClick={() => navigate('/partners')}>
                  {t('nav.partners')}
                </Button>
                <Button className="bg-transparent border border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors" onClick={() => navigate('/pricing')}>
                  {t('nav.pricing')}
                </Button>
                <Button className="bg-transparent border border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors text-xs" onClick={() => navigate('/admin')}>
                  {t('nav.admin')}
                </Button>
                <LanguageSwitcher />
              </div>

              {/* Mobile Navigation */}
              <MobileNavigation />
            </div>
          </div>
        </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-hero">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-accent text-accent-foreground mb-6">
              <Zap className="h-4 w-4 mr-2" />
              {t('hero.badge')}
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-background mb-6 leading-tight">
            {t('hero.title')}
          </h1>
          <p className="text-xl text-background/90 mb-10 max-w-3xl mx-auto leading-relaxed">
            {t('hero.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-background text-brand hover:bg-background/90 transition-colors px-8 py-4 text-lg shadow-lg font-semibold" onClick={() => navigate('/comprehensive-analysis-form')}>
              Get Comprehensive Analysis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-2 border-background text-background hover:bg-background hover:text-brand transition-colors px-8 py-4 text-lg shadow-lg" onClick={() => navigate('/guest-analysis')}>
              Try Quick Analysis (Free)
            </Button>
          </div>
        </div>
      </section>

      {/* Comprehensive Analysis Highlight Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background border-y border-primary/10">
        <div className="max-w-6xl mx-auto">
          <Card className="border-2 border-primary/20 shadow-xl bg-card/50 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-4">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Most Popular Choice
                  </div>
                  <h2 className="text-3xl font-bold text-foreground mb-4">
                    Comprehensive UK Market Analysis
                  </h2>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Get a full evidence-based assessment of your UK market readiness with actionable insights, verified partner matches, and expert review options.
                  </p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Real Metrics & Validation</p>
                        <p className="text-sm text-muted-foreground">Research-backed scoring algorithms with Companies House verification</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Advanced Partner Matching</p>
                        <p className="text-sm text-muted-foreground">85%+ match accuracy with detailed explanations and case studies</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Expert Review Available</p>
                        <p className="text-sm text-muted-foreground">Request human expert validation and consultation calls</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">UK-Specific Requirements</p>
                        <p className="text-sm text-muted-foreground">Industry benchmarks and regulatory compliance roadmap</p>
                      </div>
                    </div>
                  </div>
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-8"
                    onClick={() => navigate('/comprehensive-analysis-form')}
                  >
                    Start Comprehensive Analysis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
                
                <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-6 border border-primary/20">
                  <h3 className="text-xl font-semibold text-foreground mb-4">What You'll Get:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2 text-sm">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <BarChart3 className="h-3 w-3 text-primary" />
                      </div>
                      <span>7 evidence-based category scores with detailed breakdown</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-3 w-3 text-primary" />
                      </div>
                      <span>Score influence reports showing which factors affect your score</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Users className="h-3 w-3 text-primary" />
                      </div>
                      <span>Smart partner matches with 5-factor compatibility analysis</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Globe className="h-3 w-3 text-primary" />
                      </div>
                      <span>UK market benchmarks and industry-specific regulations</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="h-3 w-3 text-primary" />
                      </div>
                      <span>Actionable roadmap with cost estimates and timelines</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-3 w-3 text-primary" />
                      </div>
                      <span>Data quality indicators and methodology transparency</span>
                    </li>
                  </ul>
                  <div className="mt-6 p-4 bg-background/50 rounded-lg">
                    <p className="text-xs text-muted-foreground text-center">
                      ⚡ Analysis completed in minutes • 📊 Used by 100+ businesses • ⭐ 95% satisfaction rate
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              {t('features.title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-6 w-6 text-brand" />
                </div>
                <CardTitle className="text-xl">{t('features.aiScore')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  {t('features.aiScoreDesc')}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6 text-success" />
                </div>
                <CardTitle className="text-xl">{t('features.docGenerator')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  {t('features.docGeneratorDesc')}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-brand" />
                </div>
                <CardTitle className="text-xl">{t('features.partnerMatching')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  {t('features.partnerMatchingDesc')}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
                <CardTitle className="text-xl">{t('features.smartRoadmap')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  {t('features.smartRoadmapDesc')}
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section - Enhanced */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              {t('howItWorks.title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('howItWorks.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center animate-fade-in-up">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary-foreground">1</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">{t('howItWorks.step1')}</h3>
              <p className="text-muted-foreground">
                {t('howItWorks.step1Desc')}
              </p>
            </div>

            <div className="text-center animate-fade-in-up animate-delay-200">
              <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-success-foreground">2</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">{t('howItWorks.step2')}</h3>
              <p className="text-muted-foreground">
                {t('howItWorks.step2Desc')}
              </p>
            </div>

            <div className="text-center animate-fade-in-up animate-delay-400">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-accent-foreground">3</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">{t('howItWorks.step3')}</h3>
              <p className="text-muted-foreground">
                {t('howItWorks.step3Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ready to Transform Your Business Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-accent/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
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
      <footer className="bg-foreground text-muted-foreground py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BarChart3 className="h-6 w-6 text-brand" />
                <span className="text-xl font-bold text-background">Converta</span>
              </div>
              <p className="text-muted-foreground">
                {t('footer.description')}
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t('footer.platform')}</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-white transition-colors">{t('footer.features')}</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">{t('footer.pricing')}</a></li>
                <li><a href="#api" className="hover:text-white transition-colors">{t('footer.api')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t('footer.support')}</h4>
              <ul className="space-y-2">
                <li><a href="#help" className="hover:text-white transition-colors">{t('footer.helpCenter')}</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">{t('footer.contact')}</a></li>
                <li><a href="#community" className="hover:text-white transition-colors">{t('footer.community')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t('footer.legal')}</h4>
              <ul className="space-y-2">
                <li><a href="#privacy" className="hover:text-white transition-colors">{t('footer.privacy')}</a></li>
                <li><a href="#terms" className="hover:text-white transition-colors">{t('footer.terms')}</a></li>
                <li><a href="#cookies" className="hover:text-white transition-colors">{t('footer.cookies')}</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center">
            <p>{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
};

export default Index;
