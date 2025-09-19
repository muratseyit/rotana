import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BarChart3, FileText, Users, Zap, CheckCircle, Globe, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { MobileNavigation } from "@/components/MobileNavigation";
import { SEOHead } from "@/components/SEOHead";

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
                <Button variant="ghost" onClick={() => navigate('/features')}>
                  Features
                </Button>
                <Button variant="ghost" onClick={() => navigate('/partners')}>
                  Partners
                </Button>
                <Button variant="ghost" onClick={() => navigate('/pricing')}>
                  Pricing
                </Button>
                <LanguageSwitcher />
                <Button variant="outline" onClick={() => navigate('/guest-analysis')}>
                  Get Started
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
              AI-Powered UK Market Entry for Turkish SMEs
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-background mb-6 leading-tight">
            Transform Your Business with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-background to-success">AI-Powered Insights</span>
          </h1>
          <p className="text-xl text-background/90 mb-10 max-w-3xl mx-auto leading-relaxed">
            Get comprehensive business analysis, UK market insights, and partner connections - completely free
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-background text-brand hover:bg-background/90 px-8 py-4 text-lg" onClick={() => navigate('/guest-analysis')}>
              Get Free AI Analysis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-background text-background hover:bg-background hover:text-brand px-8 py-4 text-lg" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
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
              Everything You Need for UK Market Success
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive AI-powered platform designed specifically for Turkish SMEs expanding to the UK
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-6 w-6 text-brand" />
                </div>
                <CardTitle className="text-xl">AI-Powered Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Advanced artificial intelligence analyzes your business data to provide actionable insights
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6 text-success" />
                </div>
                <CardTitle className="text-xl">Comprehensive Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Get detailed reports covering market analysis, competitive landscape, and growth opportunities
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-brand" />
                </div>
                <CardTitle className="text-xl">Partner Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Connect with verified UK business partners and service providers tailored to your needs
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
                <CardTitle className="text-xl">Smart Roadmap</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Get a personalized roadmap with actionable steps to achieve your business goals
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Get started with your business analysis in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Share Your Business Info</h3>
              <p className="text-slate-600">
                Tell us about your business, goals, and current challenges through our simple form
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Get AI Analysis</h3>
              <p className="text-slate-600">
                Our AI analyzes your business data and generates comprehensive insights and recommendations
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Take Action</h3>
              <p className="text-slate-600">
                Follow your personalized roadmap and connect with recommended partners to grow your business
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-brand">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-background mb-6">
            Ready to Enter the UK Market?
          </h2>
          <p className="text-xl text-background/90 mb-8 max-w-2xl mx-auto">
            Get instant AI analysis of your business potential and connect with verified UK partners - completely free
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-background text-brand hover:bg-background/90 px-8 py-4 text-lg" onClick={() => navigate('/guest-analysis')}>
              Get Free Analysis Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="border-background text-background hover:bg-background hover:text-brand px-8 py-4 text-lg">
              Learn More
            </Button>
          </div>
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
                AI-Powered UK Market Entry for Turkish SMEs. Comprehensive analysis, partner matching, and business growth insights.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#api" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#help" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#community" className="hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#privacy" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#terms" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#cookies" className="hover:text-white transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center">
            <p>&copy; 2024 Business Bridge. All rights reserved.</p>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
};

export default Index;
