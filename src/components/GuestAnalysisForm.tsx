import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Building, FileText, Globe, Users, Briefcase, Loader2, ArrowRight, Factory } from "lucide-react";
import { trackFunnel, trackEvent } from "@/utils/analytics";

const industries = [
  "Technology & Software",
  "E-commerce & Retail",
  "Manufacturing", 
  "Healthcare & Medical",
  "Financial Services",
  "Food & Beverage",
  "Fashion & Textiles",
  "Construction & Real Estate",
  "Education & Training",
  "Tourism & Hospitality",
  "Agriculture",
  "Consultancy",
  "Other"
];

const companySizes = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees", 
  "201-500 employees",
  "500+ employees"
];

// Industries that typically sell physical goods
const goodsSellingIndustries = [
  "E-commerce & Retail",
  "Manufacturing",
  "Fashion & Textiles",
  "Food & Beverage",
  "Agriculture"
];

interface GuestAnalysisData {
  companyName: string;
  businessDescription: string;
  industry: string;
  companySize: string;
  websiteUrl: string;
  email: string;
  sellsGoods?: boolean;
  manufacturingStatus?: 'manufacturer' | 'reseller' | 'both' | '';
  customerType?: 'b2b' | 'b2c' | 'both' | '';
  exportExperience?: 'none' | 'early' | 'experienced' | 'veteran' | '';
}

// Industries that need export experience question (international markets)
const internationalMarkets = ['Europe', 'North America', 'Asia', 'Middle East'];

export function GuestAnalysisForm() {
  const [formData, setFormData] = useState<GuestAnalysisData>({
    companyName: "",
    businessDescription: "",
    industry: "",
    companySize: "",
    websiteUrl: "",
    email: "",
    sellsGoods: false,
    manufacturingStatus: "",
    customerType: "",
    exportExperience: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStarted, setFormStarted] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  // Track when user starts filling the form
  const handleFirstInteraction = () => {
    if (!formStarted) {
      setFormStarted(true);
      trackFunnel('form_start');
      trackEvent('analysis_started', { timestamp: Date.now() });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.companyName || !formData.businessDescription || !formData.industry || 
        !formData.companySize || !formData.email) {
      toast({
        title: t('analysis.form.required'),
        description: t('analysis.form.requiredDesc'),
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Track form completion
      trackFunnel('form_complete', {
        industry: formData.industry,
        companySize: formData.companySize,
        hasWebsite: !!formData.websiteUrl
      });
      trackEvent('email_captured', { email: formData.email });

      // Store the analysis data in localStorage for the results page
      localStorage.setItem('guestAnalysisData', JSON.stringify(formData));
      
      // Navigate directly to results
      window.location.href = '/guest-results';
      
    } catch (error) {
      console.error("Error processing analysis:", error);
      
      toast({
        title: "Processing Error", 
        description: "Failed to process your analysis. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Building className="h-6 w-6 text-primary" />
          {t('analysis.form.title')}
        </CardTitle>
        <CardDescription>
          {t('analysis.form.subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <span className="text-sm">📧</span>
              {t('analysis.form.email')} *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              onFocus={handleFirstInteraction}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              {t('analysis.form.companyName')} *
            </Label>
            <Input
              id="companyName"
              placeholder="Enter your company name"
              value={formData.companyName}
              onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessDescription" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {t('analysis.form.businessDesc')} *
            </Label>
            <Textarea
              id="businessDescription"
              placeholder={t('analysis.form.businessDescPlaceholder')}
              value={formData.businessDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, businessDescription: e.target.value }))}
              rows={3}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                {t('analysis.form.industry')} *
              </Label>
              <Select 
                value={formData.industry} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('analysis.form.selectIndustry')} />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {t('analysis.form.companySize')} *
              </Label>
              <Select 
                value={formData.companySize} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, companySize: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('analysis.form.selectSize')} />
                </SelectTrigger>
                <SelectContent>
                  {companySizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Conditional Manufacturing Status Question */}
          {goodsSellingIndustries.includes(formData.industry) && (
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="sellsGoods" 
                  checked={formData.sellsGoods} 
                  onCheckedChange={(checked) => setFormData(prev => ({ 
                    ...prev, 
                    sellsGoods: checked as boolean,
                    manufacturingStatus: checked ? prev.manufacturingStatus : ""
                  }))}
                />
                <Label htmlFor="sellsGoods" className="flex items-center gap-2">
                  <Factory className="h-4 w-4" />
                  {t('analysis.form.sellsGoods')}
                </Label>
              </div>

              {formData.sellsGoods && (
                <div className="space-y-3 ml-6">
                  <Label className="text-sm font-medium">{t('analysis.form.manufacturingStatus')}</Label>
                  <p className="text-xs text-muted-foreground">{t('analysis.form.manufacturingHelp')}</p>
                  <RadioGroup 
                    value={formData.manufacturingStatus} 
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      manufacturingStatus: value as 'manufacturer' | 'reseller' | 'both' 
                    }))}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="manufacturer" id="manufacturer" />
                      <Label htmlFor="manufacturer" className="text-sm font-normal cursor-pointer">
                        {t('analysis.form.manufacturerSelf')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="reseller" id="reseller" />
                      <Label htmlFor="reseller" className="text-sm font-normal cursor-pointer">
                        {t('analysis.form.resellerOnly')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="both" id="both" />
                      <Label htmlFor="both" className="text-sm font-normal cursor-pointer">
                        {t('analysis.form.manufacturerBoth')}
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
            </div>
          )}

          {/* B2B/B2C Customer Type Question - Always shown */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {t('analysis.form.customerType')} *
            </Label>
            <Select 
              value={formData.customerType} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, customerType: value as 'b2b' | 'b2c' | 'both' }))}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('analysis.form.selectCustomerType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="b2b">{t('analysis.form.customerTypeB2B')}</SelectItem>
                <SelectItem value="b2c">{t('analysis.form.customerTypeB2C')}</SelectItem>
                <SelectItem value="both">{t('analysis.form.customerTypeBoth')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="websiteUrl" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {t('analysis.form.websiteUrl')}
            </Label>
            <Input
              id="websiteUrl"
              type="url"
              placeholder="https://yourcompany.com"
              value={formData.websiteUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
            />
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <ArrowRight className="h-4 w-4" />
              {t('analysis.form.whatYouGet')}
            </div>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• {t('analysis.form.benefit1')}</li>
              <li>• {t('analysis.form.benefit2')}</li>
              <li>• {t('analysis.form.benefit3')}</li>
              <li>• {t('analysis.form.benefit4')}</li>
            </ul>
          </div>

          <Button 
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('analysis.form.processing')}
              </>
            ) : (
              <>
                {t('analysis.form.submit')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}