import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Building, FileText, Globe, Users, Briefcase, Brain } from "lucide-react";

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
  "Other"
];

const companySizes = [
  "1-10 employees",
  "11-50 employees", 
  "51-200 employees",
  "201-500 employees",
  "500+ employees"
];

interface BusinessFormData {
  companyName: string;
  businessDescription: string;
  industry: string;
  companySize: string;
  websiteUrl: string;
}

interface BusinessFormProps {
  onSuccess?: () => void;
}

export function BusinessForm({ onSuccess }: BusinessFormProps) {
  const [formData, setFormData] = useState<BusinessFormData>({
    companyName: "",
    businessDescription: "",
    industry: "",
    companySize: "",
    websiteUrl: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const analyzeWithAI = async (businessId: string) => {
    setIsAnalyzing(true);
    try {
      console.log('Starting business analysis for ID:', businessId);
      console.log('Form data:', formData);
      
      // Call the edge function to analyze the business
      const { data, error } = await supabase.functions.invoke('analyze-business', {
        body: {
          companyName: formData.companyName,
          businessDescription: formData.businessDescription,
          industry: formData.industry,
          companySize: formData.companySize,
          websiteUrl: formData.websiteUrl
        }
      });

      console.log('Analysis response:', { data, error });
      if (error) throw error;

      // Update the business record with the analysis results
      const { error: updateError } = await supabase
        .from('businesses')
        .update({
          analysis_result: data,
          overall_score: data.overallScore,
          analysis_status: 'completed',
          analyzed_at: new Date().toISOString()
        })
        .eq('id', businessId);

      if (updateError) throw updateError;

      toast({
        title: "Analysis Complete!",
        description: `Your UK market readiness score is ${data.overallScore}%`
      });

    } catch (error) {
      console.error("Error analyzing business:", error);
      
      // Update status to failed
      await supabase
        .from('businesses')
        .update({ analysis_status: 'failed' })
        .eq('id', businessId);

      // Show specific error message if available
      const errorMessage = error instanceof Error ? error.message : "Could not analyze your business. Please try again later.";
      
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to submit your business information.",
          variant: "destructive"
        });
        return;
      }

      const { data: businessData, error } = await supabase.from("businesses").insert({
        user_id: user.id,
        company_name: formData.companyName,
        business_description: formData.businessDescription,
        industry: formData.industry,
        company_size: formData.companySize,
        website_url: formData.websiteUrl || null
      }).select().single();

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your business information has been saved. Starting AI analysis..."
      });

      // Reset form
      setFormData({
        companyName: "",
        businessDescription: "",
        industry: "",
        companySize: "",
        websiteUrl: ""
      });

      // Start AI analysis
      await analyzeWithAI(businessData.id);

      onSuccess?.();
    } catch (error) {
      console.error("Error submitting business info:", error);
      toast({
        title: "Error",
        description: "Failed to save business information. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Building className="h-6 w-6 text-primary" />
          Business Information
        </CardTitle>
        <CardDescription>
          Tell us about your business to get a personalized UK market readiness assessment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="companyName" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Company Name *
            </Label>
            <Input
              id="companyName"
              type="text"
              placeholder="Enter your company name"
              value={formData.companyName}
              onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessDescription" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Business Description *
            </Label>
            <Textarea
              id="businessDescription"
              placeholder="Describe your business, products/services, and target market..."
              value={formData.businessDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, businessDescription: e.target.value }))}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Industry *
            </Label>
            <Select 
              value={formData.industry} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your industry" />
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
              Company Size *
            </Label>
            <Select 
              value={formData.companySize} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, companySize: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select company size" />
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

          <div className="space-y-2">
            <Label htmlFor="websiteUrl" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Website URL
            </Label>
            <Input
              id="websiteUrl"
              type="url"
              placeholder="https://yourcompany.com"
              value={formData.websiteUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || isAnalyzing}
          >
            {isSubmitting ? "Saving..." : 
             isAnalyzing ? (
               <div className="flex items-center gap-2">
                 <Brain className="h-4 w-4 animate-pulse" />
                 Analyzing with AI...
               </div>
             ) : "Save & Analyze Business"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}