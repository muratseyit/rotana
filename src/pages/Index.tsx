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

const Index = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleGetStarted = () => {
    navigate('/guest-analysis');
  };

  return (
    <>
      <SEOHead 
        title="Business Bridge - AI-Powered UK Market Entry for Turkish SMEs"
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
                <span className="text-2xl font-bold text-foreground">Business Bridge</span>
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
                <Button className="bg-transparent border-2 border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors" onClick={() => navigate('/guest-analysis')}>
                  {t('nav.getStarted')}
                </Button>
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
            <Button size="lg" className="bg-transparent border-2 border-background text-background hover:bg-background hover:text-brand transition-colors px-8 py-4 text-lg shadow-lg" onClick={() => navigate('/guest-analysis')}>
              {t('hero.startJourney')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" className="bg-transparent border-2 border-background text-background hover:bg-background hover:text-brand transition-colors px-8 py-4 text-lg shadow-lg" onClick={() => navigate('/dashboard')}>
              {t('nav.dashboard')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
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
                <span className="text-xl font-bold text-background">Business Bridge</span>
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
