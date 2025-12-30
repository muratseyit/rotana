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
          <Label htmlFor="companyName">{t('compForm.companyName')} *</Label>
          <Input id="companyName" value={businessData.companyName} onChange={e => updateBusinessData('companyName', e.target.value)} placeholder={t('compForm.companyNamePlaceholder')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry">{t('compForm.industry')} *</Label>
          <Select value={businessData.industry} onValueChange={value => updateBusinessData('industry', value)}>
            <SelectTrigger>
              <SelectValue placeholder={t('compForm.selectIndustry')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technology">{t('compForm.industryTechnology')}</SelectItem>
              <SelectItem value="healthcare">{t('compForm.industryHealthcare')}</SelectItem>
              <SelectItem value="retail">{t('compForm.industryRetail')}</SelectItem>
              <SelectItem value="manufacturing">{t('compForm.industryManufacturing')}</SelectItem>
              <SelectItem value="services">{t('compForm.industryServices')}</SelectItem>
              <SelectItem value="food-beverage">{t('compForm.industryFoodBeverage')}</SelectItem>
              <SelectItem value="construction">{t('compForm.industryConstruction')}</SelectItem>
              <SelectItem value="automotive">{t('compForm.industryAutomotive')}</SelectItem>
              <SelectItem value="other">{t('compForm.industryOther')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="companySize">{t('compForm.companySize')} *</Label>
          <Select value={businessData.companySize} onValueChange={value => updateBusinessData('companySize', value)}>
            <SelectTrigger>
              <SelectValue placeholder={t('compForm.selectSize')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-10">{t('compForm.size1to10')}</SelectItem>
              <SelectItem value="11-50">{t('compForm.size11to50')}</SelectItem>
              <SelectItem value="51-200">{t('compForm.size51to200')}</SelectItem>
              <SelectItem value="200+">{t('compForm.size200plus')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="yearEstablished">{t('compForm.yearEstablished')}</Label>
          <Input id="yearEstablished" type="number" value={businessData.yearEstablished} onChange={e => updateBusinessData('yearEstablished', e.target.value)} placeholder={t('compForm.yearPlaceholder')} min="1900" max={new Date().getFullYear()} />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="website">{t('compForm.websiteUrl')}</Label>
          <Input id="website" value={businessData.website} onChange={e => updateBusinessData('website', e.target.value)} placeholder={t('compForm.websitePlaceholder')} />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">{t('compForm.businessDesc')} *</Label>
          <Textarea id="description" value={businessData.description} onChange={e => updateBusinessData('description', e.target.value)} placeholder={t('compForm.businessDescPlaceholder')} rows={4} />
        </div>
      </div>
    </div>;
  const marketOptions = [
    { value: 'Domestic', label: t('compForm.marketDomestic') },
    { value: 'Europe', label: t('compForm.marketEurope') },
    { value: 'North America', label: t('compForm.marketNorthAmerica') },
    { value: 'Asia', label: t('compForm.marketAsia') },
    { value: 'Middle East', label: t('compForm.marketMiddleEast') },
    { value: 'Other', label: t('compForm.marketOther') }
  ];

  const digitalOptions = [
    { value: 'Website', label: t('compForm.digitalWebsite') },
    { value: 'Social Media', label: t('compForm.digitalSocialMedia') },
    { value: 'E-commerce', label: t('compForm.digitalEcommerce') },
    { value: 'Mobile App', label: t('compForm.digitalMobileApp') },
    { value: 'Email Marketing', label: t('compForm.digitalEmailMarketing') },
    { value: 'Digital Advertising', label: t('compForm.digitalAdvertising') }
  ];

  const renderStep2 = () => <div className="space-y-6">
      <div className="text-center mb-8">
        <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground">{t('compForm.step2Title')}</h2>
        <p className="text-muted-foreground">{t('compForm.step2Desc')}</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="products">{t('compForm.productsServices')} *</Label>
          <Textarea id="products" value={businessData.products} onChange={e => updateBusinessData('products', e.target.value)} placeholder={t('compForm.productsPlaceholder')} rows={3} />
        </div>

        <div className="space-y-2">
          <Label>{t('compForm.currentMarkets')}</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {marketOptions.map(market => <div key={market.value} className="flex items-center space-x-2">
                <Checkbox id={market.value} checked={businessData.currentMarkets.includes(market.value)} onCheckedChange={checked => handleCheckboxChange('currentMarkets', market.value, checked as boolean)} />
                <Label htmlFor={market.value} className="text-sm">{market.label}</Label>
              </div>)}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="annualRevenue">{t('compForm.annualRevenue')}</Label>
          <Select value={businessData.annualRevenue} onValueChange={value => updateBusinessData('annualRevenue', value)}>
            <SelectTrigger>
              <SelectValue placeholder={t('compForm.selectRevenue')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0-50k">{t('compForm.revenue0to50k')}</SelectItem>
              <SelectItem value="50k-250k">{t('compForm.revenue50to250k')}</SelectItem>
              <SelectItem value="250k-1m">{t('compForm.revenue250to1m')}</SelectItem>
              <SelectItem value="1m-5m">{t('compForm.revenue1to5m')}</SelectItem>
              <SelectItem value="5m+">{t('compForm.revenue5mplus')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t('compForm.digitalPresence')}</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {digitalOptions.map(platform => <div key={platform.value} className="flex items-center space-x-2">
                <Checkbox id={platform.value} checked={businessData.digitalPresence.includes(platform.value)} onCheckedChange={checked => handleCheckboxChange('digitalPresence', platform.value, checked as boolean)} />
                <Label htmlFor={platform.value} className="text-sm">{platform.label}</Label>
              </div>)}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="hasOnlineStore" checked={businessData.hasOnlineStore} onCheckedChange={checked => updateBusinessData('hasOnlineStore', checked)} />
            <Label htmlFor="hasOnlineStore">{t('compForm.hasOnlineStore')}</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="hasEcommercePlatform" checked={businessData.hasEcommercePlatform} onCheckedChange={checked => updateBusinessData('hasEcommercePlatform', checked)} />
            <Label htmlFor="hasEcommercePlatform">{t('compForm.hasEcommerce')}</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="hasEnglishWebsite" checked={businessData.hasEnglishWebsite} onCheckedChange={checked => updateBusinessData('hasEnglishWebsite', checked)} />
            <Label htmlFor="hasEnglishWebsite">{t('compForm.hasEnglishWebsite')}</Label>
          </div>
        </div>
      </div>
    </div>;
  const complianceOptions = [
    { value: 'ISO Standards', label: t('compForm.complianceISO') },
    { value: 'CE Marking', label: t('compForm.complianceCE') },
    { value: 'FDA Approval', label: t('compForm.complianceFDA') },
    { value: 'GDPR Compliance', label: t('compForm.complianceGDPR') },
    { value: 'Export Licensing', label: t('compForm.complianceExport') },
    { value: 'Quality Systems', label: t('compForm.complianceQuality') }
  ];

  const certificationOptions = [
    { value: 'ISO 9001', label: t('compForm.certISO9001') },
    { value: 'ISO 14001', label: t('compForm.certISO14001') },
    { value: 'OHSAS 18001', label: t('compForm.certOHSAS') },
    { value: 'Organic Certification', label: t('compForm.certOrganic') },
    { value: 'Fair Trade', label: t('compForm.certFairTrade') },
    { value: 'Industry Specific', label: t('compForm.certIndustry') }
  ];

  const regionOptions = [
    { value: 'UK', label: t('compForm.regionUK') },
    { value: 'Europe', label: t('compForm.regionEurope') },
    { value: 'North America', label: t('compForm.regionNorthAmerica') },
    { value: 'Asia Pacific', label: t('compForm.regionAsiaPacific') },
    { value: 'Middle East', label: t('compForm.regionMiddleEast') },
    { value: 'Global', label: t('compForm.regionGlobal') }
  ];

  const renderStep3 = () => <div className="space-y-6">
      <div className="text-center mb-8">
        <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground">{t('compForm.step3Title')}</h2>
        <p className="text-muted-foreground">{t('compForm.step3Desc')}</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label>{t('compForm.regulatoryCompliance')}</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {complianceOptions.map(compliance => <div key={compliance.value} className="flex items-center space-x-2">
                <Checkbox id={compliance.value} checked={businessData.regulatoryCompliance.includes(compliance.value)} onCheckedChange={checked => handleCheckboxChange('regulatoryCompliance', compliance.value, checked as boolean)} />
                <Label htmlFor={compliance.value} className="text-sm">{compliance.label}</Label>
              </div>)}
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t('compForm.qualityCerts')}</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {certificationOptions.map(cert => <div key={cert.value} className="flex items-center space-x-2">
                <Checkbox id={cert.value} checked={businessData.qualityCertifications.includes(cert.value)} onCheckedChange={checked => handleCheckboxChange('qualityCertifications', cert.value, checked as boolean)} />
                <Label htmlFor={cert.value} className="text-sm">{cert.label}</Label>
              </div>)}
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t('compForm.targetRegions')}</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {regionOptions.map(region => <div key={region.value} className="flex items-center space-x-2">
                <Checkbox id={region.value} checked={businessData.targetRegions.includes(region.value)} onCheckedChange={checked => handleCheckboxChange('targetRegions', region.value, checked as boolean)} />
                <Label htmlFor={region.value} className="text-sm">{region.label}</Label>
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
          <Label htmlFor="businessGoals">{t('compForm.businessGoals')} *</Label>
          <Textarea id="businessGoals" value={businessData.businessGoals} onChange={e => updateBusinessData('businessGoals', e.target.value)} placeholder={t('compForm.goalsPlaceholder')} rows={4} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeline">{t('compForm.timeline')}</Label>
          <Select value={businessData.timeline} onValueChange={value => updateBusinessData('timeline', value)}>
            <SelectTrigger>
              <SelectValue placeholder={t('compForm.selectTimeline')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3-6 months">{t('compForm.timeline3to6')}</SelectItem>
              <SelectItem value="6-12 months">{t('compForm.timeline6to12')}</SelectItem>
              <SelectItem value="1-2 years">{t('compForm.timeline1to2')}</SelectItem>
              <SelectItem value="2+ years">{t('compForm.timeline2plus')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="budget">{t('compForm.budget')}</Label>
          <Select value={businessData.budget} onValueChange={value => updateBusinessData('budget', value)}>
            <SelectTrigger>
              <SelectValue placeholder={t('compForm.selectBudget')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0-10k">{t('compForm.budget0to10k')}</SelectItem>
              <SelectItem value="10k-50k">{t('compForm.budget10to50k')}</SelectItem>
              <SelectItem value="50k-100k">{t('compForm.budget50to100k')}</SelectItem>
              <SelectItem value="100k+">{t('compForm.budget100kplus')}</SelectItem>
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