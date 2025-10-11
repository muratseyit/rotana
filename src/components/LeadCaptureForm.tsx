import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Phone, Building2, User, MessageSquare, Gift, Zap, ArrowRight } from "lucide-react";

interface LeadData {
  name: string;
  email: string;
  phone: string;
  company: string;
  industry: string;
  message: string;
  leadSource: string;
  interests: string[];
}

interface LeadCaptureFormProps {
  variant?: 'hero' | 'sidebar' | 'popup' | 'footer';
  title?: string;
  description?: string;
  incentive?: string;
  onSuccess?: (data: LeadData) => void;
}

export function LeadCaptureForm({ 
  variant = 'hero',
  title,
  description,
  incentive,
  onSuccess 
}: LeadCaptureFormProps) {
  const [formData, setFormData] = useState<LeadData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    industry: '',
    message: '',
    leadSource: 'website',
    interests: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const leadSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
    email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
    phone: z.string().regex(/^[+]?[0-9\s\-()]*$/, "Invalid phone number format").max(20, "Phone must be less than 20 characters").optional().or(z.literal("")),
    company: z.string().trim().min(1, "Company name is required").max(200, "Company name must be less than 200 characters"),
    industry: z.string().max(100, "Industry must be less than 100 characters").optional().or(z.literal("")),
    message: z.string().max(1000, "Message must be less than 1000 characters").optional().or(z.literal("")),
    leadSource: z.string(),
    interests: z.array(z.string())
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate input data
      const validated = leadSchema.parse(formData);

      // Save lead to database - using businesses table with correct schema
      const { error } = await supabase
        .from('businesses')
        .insert([{
          company_name: validated.company,
          business_description: validated.message || 'Lead from website',
          industry: validated.industry || 'Technology',
          company_size: 'small',
          user_id: '', // Will be empty for leads
          website_url: '',
          contact_email: validated.email,
          contact_phone: validated.phone,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      // Send welcome email (you can implement this as an edge function)
      await supabase.functions.invoke('send-welcome-email', {
        body: {
          name: validated.name,
          email: validated.email,
          company: validated.company
        }
      });

      toast({
        title: t('leadForm.successTitle'),
        description: t('leadForm.successDesc'),
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        industry: '',
        message: '',
        leadSource: 'website',
        interests: []
      });

      onSuccess?.(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        toast({
          title: "Validation Error",
          description: firstError.message,
          variant: "destructive"
        });
      } else {
        console.error('Error submitting lead:', error);
        toast({
          title: t('leadForm.errorTitle'),
          description: t('leadForm.errorDesc'),
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const availableInterests = [
    t('interest.ukMarketEntry'),
    t('interest.businessAnalysis'),
    t('interest.partnerMatching'),
    t('interest.complianceSupport'),
    t('interest.financialPlanning'),
    t('interest.digitalMarketing')
  ];

  const getVariantStyles = () => {
    switch (variant) {
      case 'sidebar':
        return 'max-w-sm';
      case 'popup':
        return 'max-w-md mx-auto';
      case 'footer':
        return 'max-w-2xl mx-auto bg-card/80 backdrop-blur-sm';
      default:
        return 'max-w-2xl mx-auto';
    }
  };

  const defaultTitle = variant === 'hero' 
    ? t('leadForm.defaultTitle')
    : t('leadForm.defaultTitleAlt');
    
  const defaultDescription = variant === 'hero'
    ? t('leadForm.defaultDesc')
    : t('leadForm.defaultDescAlt');

  const defaultIncentive = t('leadForm.incentive');

  return (
    <Card className={getVariantStyles()}>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-xl md:text-2xl">
          <Zap className="h-6 w-6 text-primary" />
          {title || defaultTitle}
        </CardTitle>
        <CardDescription className="text-base">
          {description || defaultDescription}
        </CardDescription>
        {(incentive || defaultIncentive) && (
          <Badge variant="secondary" className="mx-auto gap-2 py-2 px-4">
            <Gift className="h-4 w-4" />
            {incentive || defaultIncentive}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                {t('leadForm.fullName')} *
              </label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                placeholder={t('leadForm.namePlaceholder')}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {t('leadForm.email')} *
              </label>
              <Input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                placeholder={t('leadForm.emailPlaceholder')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {t('leadForm.phone')}
              </label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                placeholder={t('leadForm.phonePlaceholder')}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                {t('leadForm.company')} *
              </label>
              <Input
                required
                value={formData.company}
                onChange={(e) => setFormData(prev => ({...prev, company: e.target.value}))}
                placeholder={t('leadForm.companyPlaceholder')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t('leadForm.industry')}</label>
            <select
              value={formData.industry}
              onChange={(e) => setFormData(prev => ({...prev, industry: e.target.value}))}
              className="w-full px-3 py-2 border rounded-md text-sm"
            >
              <option value="">{t('leadForm.selectIndustry')}</option>
              <option value="technology">{t('industry.technology')}</option>
              <option value="manufacturing">{t('industry.manufacturing')}</option>
              <option value="retail">{t('industry.retail')}</option>
              <option value="food-beverage">{t('industry.foodBeverage')}</option>
              <option value="textiles">{t('industry.textiles')}</option>
              <option value="healthcare">{t('industry.healthcare')}</option>
              <option value="construction">{t('industry.construction')}</option>
              <option value="automotive">{t('industry.automotive')}</option>
              <option value="finance">{t('industry.finance')}</option>
              <option value="consulting">{t('industry.consulting')}</option>
              <option value="other">{t('industry.other')}</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t('leadForm.interests')}</label>
            <div className="flex flex-wrap gap-2">
              {availableInterests.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleInterestToggle(interest)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    formData.interests.includes(interest)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-input hover:bg-accent'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              {t('leadForm.goals')}
            </label>
            <Textarea
              value={formData.message}
              onChange={(e) => setFormData(prev => ({...prev, message: e.target.value}))}
              placeholder={t('leadForm.goalsPlaceholder')}
              rows={3}
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full gap-2 py-3 text-base"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                {t('leadForm.processing')}
              </>
            ) : (
              <>
                {t('leadForm.submit')}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            {t('leadForm.privacy')}
          </p>
        </form>
      </CardContent>
    </Card>
  );
}