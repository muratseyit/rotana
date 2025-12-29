import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Building, Users, Globe, FileText } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface BusinessData {
  companyName: string;
  industry: string;
  companySize: string;
  yearEstablished: string;
  website: string;
  description: string;
  products: string;
  currentMarkets: string[];
  annualRevenue: string;
  digitalPresence: string[];
  hasOnlineStore: boolean;
  hasEcommercePlatform: boolean;
  hasEnglishWebsite: boolean;
  regulatoryCompliance: string[];
  qualityCertifications: string[];
  targetRegions: string[];
  businessGoals: string;
  timeline: string;
  budget: string;
}
const ComprehensiveAnalysisForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [businessData, setBusinessData] = useState<BusinessData>({
    companyName: "",
    industry: "",
    companySize: "",
    yearEstablished: "",
    website: "",
    description: "",
    products: "",
    currentMarkets: [],
    annualRevenue: "",
    digitalPresence: [],
    hasOnlineStore: false,
    hasEcommercePlatform: false,
    hasEnglishWebsite: false,
    regulatoryCompliance: [],
    qualityCertifications: [],
    targetRegions: [],
    businessGoals: "",
    timeline: "",
    budget: ""
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const totalSteps = 4;
  const progress = currentStep / totalSteps * 100;
  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  const handleSubmit = () => {
    // Save data to localStorage for comprehensive analysis
    localStorage.setItem('comprehensiveBusinessData', JSON.stringify(businessData));
    toast({
      title: t('compForm.submitted'),
      description: t('compForm.processing')
    });
    setTimeout(() => {
      navigate('/comprehensive-analysis');
    }, 1500);
  };
  const updateBusinessData = (field: keyof BusinessData, value: any) => {
    setBusinessData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleCheckboxChange = (field: keyof BusinessData, value: string, checked: boolean) => {
    setBusinessData(prev => {
      const currentArray = prev[field] as string[];
      if (checked) {
        return {
          ...prev,
          [field]: [...currentArray, value]
        };
      } else {
        return {
          ...prev,
          [field]: currentArray.filter(item => item !== value)
        };
      }
    });
  };
  const renderStep1 = () => <div className="space-y-6">
      <div className="text-center mb-8">
        <Building className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground">{t('compForm.step1Title')}</h2>
        <p className="text-muted-foreground">{t('compForm.step1Desc')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name *</Label>
          <Input id="companyName" value={businessData.companyName} onChange={e => updateBusinessData('companyName', e.target.value)} placeholder="Enter your company name" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry">Industry *</Label>
          <Select value={businessData.industry} onValueChange={value => updateBusinessData('industry', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="retail">Retail</SelectItem>
              <SelectItem value="manufacturing">Manufacturing</SelectItem>
              <SelectItem value="services">Services</SelectItem>
              <SelectItem value="food-beverage">Food & Beverage</SelectItem>
              <SelectItem value="construction">Construction</SelectItem>
              <SelectItem value="automotive">Automotive</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="companySize">Company Size *</Label>
          <Select value={businessData.companySize} onValueChange={value => updateBusinessData('companySize', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select company size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-10">1-10 employees</SelectItem>
              <SelectItem value="11-50">11-50 employees</SelectItem>
              <SelectItem value="51-200">51-200 employees</SelectItem>
              <SelectItem value="200+">200+ employees</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="yearEstablished">Year Established</Label>
          <Input id="yearEstablished" type="number" value={businessData.yearEstablished} onChange={e => updateBusinessData('yearEstablished', e.target.value)} placeholder="2020" min="1900" max={new Date().getFullYear()} />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="website">Website URL</Label>
          <Input id="website" value={businessData.website} onChange={e => updateBusinessData('website', e.target.value)} placeholder="https://www.yourcompany.com" />
        </div>

        

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Business Description *</Label>
          <Textarea id="description" value={businessData.description} onChange={e => updateBusinessData('description', e.target.value)} placeholder="Describe what your business does, your main products/services, and what makes you unique" rows={4} />
        </div>
      </div>
    </div>;
  const renderStep2 = () => <div className="space-y-6">
      <div className="text-center mb-8">
        <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground">{t('compForm.step2Title')}</h2>
        <p className="text-muted-foreground">{t('compForm.step2Desc')}</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="products">Products/Services *</Label>
          <Textarea id="products" value={businessData.products} onChange={e => updateBusinessData('products', e.target.value)} placeholder="Describe your main products or services in detail" rows={3} />
        </div>

        <div className="space-y-2">
          <Label>Current Markets</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {['Domestic', 'Europe', 'North America', 'Asia', 'Middle East', 'Other'].map(market => <div key={market} className="flex items-center space-x-2">
                <Checkbox id={market} checked={businessData.currentMarkets.includes(market)} onCheckedChange={checked => handleCheckboxChange('currentMarkets', market, checked as boolean)} />
                <Label htmlFor={market} className="text-sm">{market}</Label>
              </div>)}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="annualRevenue">Annual Revenue</Label>
          <Select value={businessData.annualRevenue} onValueChange={value => updateBusinessData('annualRevenue', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select revenue range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0-50k">$0 - $50k</SelectItem>
              <SelectItem value="50k-250k">$50k - $250k</SelectItem>
              <SelectItem value="250k-1m">$250k - $1M</SelectItem>
              <SelectItem value="1m-5m">$1M - $5M</SelectItem>
              <SelectItem value="5m+">$5M+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Digital Presence</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {['Website', 'Social Media', 'E-commerce', 'Mobile App', 'Email Marketing', 'Digital Advertising'].map(platform => <div key={platform} className="flex items-center space-x-2">
                <Checkbox id={platform} checked={businessData.digitalPresence.includes(platform)} onCheckedChange={checked => handleCheckboxChange('digitalPresence', platform, checked as boolean)} />
                <Label htmlFor={platform} className="text-sm">{platform}</Label>
              </div>)}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="hasOnlineStore" checked={businessData.hasOnlineStore} onCheckedChange={checked => updateBusinessData('hasOnlineStore', checked)} />
            <Label htmlFor="hasOnlineStore">We have an online store</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="hasEcommercePlatform" checked={businessData.hasEcommercePlatform} onCheckedChange={checked => updateBusinessData('hasEcommercePlatform', checked)} />
            <Label htmlFor="hasEcommercePlatform">We use e-commerce platforms (Shopify, WooCommerce, etc.)</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="hasEnglishWebsite" checked={businessData.hasEnglishWebsite} onCheckedChange={checked => updateBusinessData('hasEnglishWebsite', checked)} />
            <Label htmlFor="hasEnglishWebsite">Our website is available in English</Label>
          </div>
        </div>
      </div>
    </div>;
  const renderStep3 = () => <div className="space-y-6">
      <div className="text-center mb-8">
        <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground">{t('compForm.step3Title')}</h2>
        <p className="text-muted-foreground">{t('compForm.step3Desc')}</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Regulatory Compliance Experience</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {['ISO Standards', 'CE Marking', 'FDA Approval', 'GDPR Compliance', 'Export Licensing', 'Quality Systems'].map(compliance => <div key={compliance} className="flex items-center space-x-2">
                <Checkbox id={compliance} checked={businessData.regulatoryCompliance.includes(compliance)} onCheckedChange={checked => handleCheckboxChange('regulatoryCompliance', compliance, checked as boolean)} />
                <Label htmlFor={compliance} className="text-sm">{compliance}</Label>
              </div>)}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Quality Certifications</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {['ISO 9001', 'ISO 14001', 'OHSAS 18001', 'Organic Certification', 'Fair Trade', 'Industry Specific'].map(cert => <div key={cert} className="flex items-center space-x-2">
                <Checkbox id={cert} checked={businessData.qualityCertifications.includes(cert)} onCheckedChange={checked => handleCheckboxChange('qualityCertifications', cert, checked as boolean)} />
                <Label htmlFor={cert} className="text-sm">{cert}</Label>
              </div>)}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Target Expansion Regions</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {['UK', 'Europe', 'North America', 'Asia Pacific', 'Middle East', 'Global'].map(region => <div key={region} className="flex items-center space-x-2">
                <Checkbox id={region} checked={businessData.targetRegions.includes(region)} onCheckedChange={checked => handleCheckboxChange('targetRegions', region, checked as boolean)} />
                <Label htmlFor={region} className="text-sm">{region}</Label>
              </div>)}
          </div>
        </div>
      </div>
    </div>;
  const renderStep4 = () => <div className="space-y-6">
      <div className="text-center mb-8">
        <Users className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground">{t('compForm.step4Title')}</h2>
        <p className="text-muted-foreground">{t('compForm.step4Desc')}</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="businessGoals">Business Goals *</Label>
          <Textarea id="businessGoals" value={businessData.businessGoals} onChange={e => updateBusinessData('businessGoals', e.target.value)} placeholder="What are your main goals for business expansion? What do you hope to achieve?" rows={4} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeline">Expansion Timeline</Label>
          <Select value={businessData.timeline} onValueChange={value => updateBusinessData('timeline', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your timeline" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3-6 months">3-6 months</SelectItem>
              <SelectItem value="6-12 months">6-12 months</SelectItem>
              <SelectItem value="1-2 years">1-2 years</SelectItem>
              <SelectItem value="2+ years">2+ years</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="budget">Investment Budget</Label>
          <Select value={businessData.budget} onValueChange={value => updateBusinessData('budget', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select budget range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0-10k">$0 - $10k</SelectItem>
              <SelectItem value="10k-50k">$10k - $50k</SelectItem>
              <SelectItem value="50k-100k">$50k - $100k</SelectItem>
              <SelectItem value="100k+">$100k+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>;
  return <div className="min-h-screen bg-gradient-to-br from-background to-primary/5">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Building className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-foreground">Converta</span>
            </Link>
            <div className="text-sm text-muted-foreground">
              {t('compForm.step')} {currentStep} {t('compForm.of')} {totalSteps}
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Progress value={progress} className="h-2" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-3">{t('compForm.title')}</h1>
          <p className="text-lg text-muted-foreground">{t('compForm.subtitle')}</p>
        </div>

        <Card>
          <CardContent className="p-8">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
              <Button variant="outline" onClick={handleBack} disabled={currentStep === 1} className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>{t('compForm.back')}</span>
              </Button>

              <Button onClick={handleNext} className="flex items-center space-x-2">
                <span>{currentStep === totalSteps ? t('compForm.complete') : t('compForm.next')}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default ComprehensiveAnalysisForm;