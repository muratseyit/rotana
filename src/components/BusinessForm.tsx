import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Building, FileText, Globe, Users, Briefcase, Brain, ArrowRight, ArrowLeft, DollarSign, Shield } from "lucide-react";
import { FinancialMetricsForm, type FinancialMetrics } from "./FinancialMetricsForm";
import { ComplianceAssessment, type ComplianceStatus } from "./ComplianceAssessment";

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

interface CombinedFormData extends BusinessFormData {
  financialMetrics: FinancialMetrics;
  complianceStatus: ComplianceStatus;
}

interface BusinessFormProps {
  onSuccess?: () => void;
}

export function BusinessForm({ onSuccess }: BusinessFormProps) {
  const [activeTab, setActiveTab] = useState("business");
  const [formData, setFormData] = useState<BusinessFormData>({
    companyName: "",
    businessDescription: "",
    industry: "",
    companySize: "",
    websiteUrl: ""
  });
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetrics>({
    annualRevenue: 0,
    grossMargin: 0,
    netProfit: 0,
    monthlyGrowthRate: 0,
    cashPosition: 0,
    fundingStage: "",
    exportPercentage: 0,
    avgOrderValue: 0,
    customerAcquisitionCost: 0,
    customerLifetimeValue: 0,
  });
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const analyzeWithAI = async (businessId: string, combinedData: CombinedFormData) => {
    setIsAnalyzing(true);
    try {
      console.log('Starting business analysis for ID:', businessId);
      console.log('Form data:', combinedData);
      
      // Call the edge function to analyze the business
      const { data, error } = await supabase.functions.invoke('analyze-business', {
        body: {
          companyName: combinedData.companyName,
          businessDescription: combinedData.businessDescription,
          industry: combinedData.industry,
          companySize: combinedData.companySize,
          websiteUrl: combinedData.websiteUrl,
          financialMetrics: combinedData.financialMetrics,
          complianceStatus: combinedData.complianceStatus
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

      // Save analysis to history
      const { error: historyError } = await supabase
        .from('business_analysis_history')
        .insert({
          business_id: businessId,
          overall_score: data.overallScore,
          score_breakdown: data.scoreBreakdown,
          analysis_result: data,
          analysis_version: 'v2'
        });

      if (historyError) {
        console.error('Error saving analysis history:', historyError);
        // Don't throw error for history save failure
      }

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

  const handleBusinessInfoNext = () => {
    // Validate required fields
    if (!formData.companyName || !formData.businessDescription || !formData.industry || !formData.companySize) {
      toast({
        title: "Required Fields",
        description: "Please fill in all required business information fields.",
        variant: "destructive"
      });
      return;
    }
    setActiveTab("financial");
  };

  const handleFinancialNext = (metrics: FinancialMetrics) => {
    setFinancialMetrics(metrics);
    setActiveTab("compliance");
  };

  const handleComplianceUpdate = (status: ComplianceStatus) => {
    setComplianceStatus(status);
  };

  const handleSubmit = async () => {
    if (!complianceStatus) {
      toast({
        title: "Compliance Assessment Required",
        description: "Please complete the compliance assessment first.",
        variant: "destructive"
      });
      return;
    }

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
        website_url: formData.websiteUrl || null,
        financial_metrics: financialMetrics as any,
        compliance_status: complianceStatus as any
      }).select().single();

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your business information has been saved. Starting AI analysis..."
      });

      const combinedData: CombinedFormData = {
        ...formData,
        financialMetrics,
        complianceStatus
      };

      // Start AI analysis with combined data
      await analyzeWithAI(businessData.id, combinedData);

      // Reset form
      setFormData({
        companyName: "",
        businessDescription: "",
        industry: "",
        companySize: "",
        websiteUrl: ""
      });
      setFinancialMetrics({
        annualRevenue: 0,
        grossMargin: 0,
        netProfit: 0,
        monthlyGrowthRate: 0,
        cashPosition: 0,
        fundingStage: "",
        exportPercentage: 0,
        avgOrderValue: 0,
        customerAcquisitionCost: 0,
        customerLifetimeValue: 0,
      });
      setComplianceStatus(null);
      setActiveTab("business");

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
    <Card className="w-full max-w-4xl">
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Building className="h-6 w-6 text-primary" />
          Business Analysis Setup
        </CardTitle>
        <CardDescription>
          Complete business information, financial metrics, and compliance assessment for a comprehensive UK market readiness analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="business" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Business Info
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-2" disabled={!formData.companyName || !formData.businessDescription || !formData.industry || !formData.companySize}>
              <DollarSign className="h-4 w-4" />
              Financial Metrics
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center gap-2" disabled={!formData.companyName || !formData.businessDescription || !formData.industry || !formData.companySize}>
              <Shield className="h-4 w-4" />
              Compliance
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="business" className="space-y-6">
            <div className="space-y-6">
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
                onClick={handleBusinessInfoNext}
                className="w-full"
                disabled={!formData.companyName || !formData.businessDescription || !formData.industry || !formData.companySize}
              >
                Next: Financial Metrics
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={() => setActiveTab("business")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Business Info
              </Button>
            </div>
            
            <FinancialMetricsForm
              onSubmit={handleFinancialNext}
              initialData={financialMetrics}
              isLoading={isSubmitting || isAnalyzing}
            />
            <Button 
              onClick={() => handleFinancialNext(financialMetrics)}
              className="w-full mt-4"
              disabled={isSubmitting || isAnalyzing}
            >
              Next: Compliance Assessment
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            
            {isAnalyzing && (
              <div className="flex items-center justify-center gap-2 p-4 bg-muted rounded-lg">
                <Brain className="h-5 w-5 animate-pulse text-primary" />
                <span className="text-sm font-medium">Analyzing your business with AI...</span>
              </div>
            )}
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={() => setActiveTab("financial")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Financial Metrics
              </Button>
            </div>
            
            <ComplianceAssessment
              complianceStatus={complianceStatus || undefined}
              onUpdate={handleComplianceUpdate}
              isLoading={isSubmitting || isAnalyzing}
              selectedIndustry={formData.industry}
            />
            
            <Button 
              onClick={handleSubmit}
              className="w-full mt-4"
              disabled={!complianceStatus || isSubmitting || isAnalyzing}
            >
              Complete Analysis
              <Brain className="h-4 w-4 ml-2" />
            </Button>
            
            {isAnalyzing && (
              <div className="flex items-center justify-center gap-2 p-4 bg-muted rounded-lg">
                <Brain className="h-5 w-5 animate-pulse text-primary" />
                <span className="text-sm font-medium">Analyzing your business with AI...</span>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}