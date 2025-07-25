import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EnhancedAnalysisResults } from "./EnhancedAnalysisResults";
import { ProgressTracking } from "./ProgressTracking";
import { FinancialMetricsForm, FinancialMetrics } from "./FinancialMetricsForm";
import { ComplianceAssessment, ComplianceStatus } from "./ComplianceAssessment";
import { Building, TrendingUp, DollarSign, Shield, History, Settings } from "lucide-react";

interface Business {
  id: string;
  company_name: string;
  business_description: string;
  industry: string;
  company_size: string;
  website_url: string | null;
  created_at: string;
  analysis_result: any;
  overall_score: number | null;
  analysis_status: string | null;
  analyzed_at: string | null;
  financial_metrics?: any;
  compliance_status?: any;
}

interface BusinessDetailsModalProps {
  business: Business;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

export function BusinessDetailsModal({ business, isOpen, onOpenChange, onUpdate }: BusinessDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("analysis");
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  // Early return if business is null
  if (!business) {
    return null;
  }

  const retryAnalysis = async () => {
    setIsUpdating(true);
    try {
      console.log('Retrying analysis for business ID:', business.id);
      
      // Call the edge function to re-analyze the business
      const { data, error } = await supabase.functions.invoke('analyze-business', {
        body: {
          companyName: business.company_name,
          businessDescription: business.business_description,
          industry: business.industry,
          companySize: business.company_size,
          websiteUrl: business.website_url,
          financialMetrics: business.financial_metrics
        },
      });

      if (error) {
        console.error('Analysis error:', error);
        toast({
          title: "Analysis Error",
          description: error.message || "Failed to analyze business. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Analysis response:', { data, error });

      // Update the business with analysis results
      const { error: updateError } = await supabase
        .from('businesses')
        .update({
          analysis_result: data,
          overall_score: data.overallScore,
          analysis_status: 'completed',
          analyzed_at: new Date().toISOString(),
        })
        .eq('id', business.id);

      if (updateError) {
        console.error('Database update error:', updateError);
        toast({
          title: "Database Error",
          description: "Failed to save analysis results.",
          variant: "destructive",
        });
        return;
      }

      // Save to history
      const { error: historyError } = await supabase
        .from('business_analysis_history')
        .insert({
          business_id: business.id,
          analysis_result: data,
          overall_score: data.overallScore,
          score_breakdown: data.scoreBreakdown,
        });

      if (historyError) {
        console.error('History save error:', historyError);
      }

      toast({
        title: "Analysis Complete",
        description: "Business analysis has been completed successfully.",
      });

      // Refresh by calling onUpdate
      onUpdate?.();
      
    } catch (error) {
      console.error('Retry analysis error:', error);
      toast({
        title: "Error",
        description: "Failed to retry analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFinancialMetricsSubmit = async (metrics: FinancialMetrics) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ financial_metrics: metrics as any })
        .eq('id', business.id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Financial metrics saved successfully"
      });

      onUpdate?.();
    } catch (error) {
      console.error('Error saving financial metrics:', error);
      toast({
        title: "Error",
        description: "Failed to save financial metrics",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleComplianceUpdate = async (status: ComplianceStatus) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ compliance_status: status as any })
        .eq('id', business.id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Compliance status updated successfully"
      });

      onUpdate?.();
    } catch (error) {
      console.error('Error updating compliance status:', error);
      toast({
        title: "Error",
        description: "Failed to update compliance status",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const reanalyzeWithFinancials = async () => {
    setIsUpdating(true);
    try {
      // Call the edge function with updated financial data
      const { data, error } = await supabase.functions.invoke('analyze-business', {
        body: {
          companyName: business.company_name,
          businessDescription: business.business_description,
          industry: business.industry,
          companySize: business.company_size,
          websiteUrl: business.website_url,
          financialMetrics: business.financial_metrics
        }
      });

      if (error) throw error;

      // Update the business record
      const { error: updateError } = await supabase
        .from('businesses')
        .update({
          analysis_result: data,
          overall_score: data.overallScore,
          analysis_status: 'completed',
          analyzed_at: new Date().toISOString()
        })
        .eq('id', business.id);

      if (updateError) throw updateError;

      // Save to history
      const { error: historyError } = await supabase
        .from('business_analysis_history')
        .insert({
          business_id: business.id,
          overall_score: data.overallScore,
          score_breakdown: data.scoreBreakdown,
          analysis_result: data,
          analysis_version: 'v2'
        });

      if (historyError) {
        console.error('Error saving analysis history:', historyError);
      }

      toast({
        title: "Re-analysis Complete!",
        description: `Updated score: ${data.overallScore}%`
      });

      onUpdate?.();
    } catch (error) {
      console.error('Error re-analyzing business:', error);
      toast({
        title: "Re-analysis Failed",
        description: "Could not re-analyze business. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!business.analysis_result || business.analysis_status === 'pending') {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              {business.company_name}
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8 space-y-4">
            {business.analysis_status === 'pending' ? (
              <>
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="outline" className="animate-pulse">
                    Analysis Pending
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  The analysis for this business is currently pending. This might be due to a network issue or website fetching delay.
                </p>
                <Button 
                  onClick={retryAnalysis}
                  disabled={isUpdating}
                  className="w-full max-w-md"
                >
                  {isUpdating ? "Retrying Analysis..." : "Retry Analysis"}
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground">
                No analysis data available for this business yet.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              {business.company_name}
            </div>
            <div className="flex items-center gap-2">
              {business.overall_score && (
                <Badge variant="outline">
                  Score: {business.overall_score}%
                </Badge>
              )}
              <Badge variant="secondary">
                {business.industry}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Progress
            </TabsTrigger>
            <TabsTrigger value="financials" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Financials
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Compliance
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="mt-6">
            <EnhancedAnalysisResults
              analysis={business.analysis_result}
              companyName={business.company_name}
              onViewProgress={() => setActiveTab("progress")}
            />
          </TabsContent>

          <TabsContent value="progress" className="mt-6">
            <ProgressTracking
              businessId={business.id}
              currentScore={business.overall_score || 0}
            />
          </TabsContent>

          <TabsContent value="financials" className="mt-6">
            <div className="space-y-6">
              <FinancialMetricsForm
                onSubmit={handleFinancialMetricsSubmit}
                initialData={business.financial_metrics}
                isLoading={isUpdating}
              />
              
              {business.financial_metrics && (
                <div className="flex justify-center">
                  <Button 
                    onClick={reanalyzeWithFinancials}
                    disabled={isUpdating}
                    className="w-full max-w-md"
                  >
                    {isUpdating ? "Re-analyzing..." : "Re-analyze with Financial Data"}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="compliance" className="mt-6">
            <ComplianceAssessment
              complianceStatus={business.compliance_status}
              onUpdate={handleComplianceUpdate}
              isLoading={isUpdating}
              selectedIndustry={business.industry || "Other"}
            />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium mb-2">Business Details</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><strong>Industry:</strong> {business.industry}</p>
                    <p><strong>Size:</strong> {business.company_size}</p>
                    <p><strong>Website:</strong> {business.website_url || 'Not provided'}</p>
                    <p><strong>Created:</strong> {new Date(business.created_at).toLocaleDateString()}</p>
                    {business.analyzed_at && (
                      <p><strong>Last Analysis:</strong> {new Date(business.analyzed_at).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Business Description</h3>
                  <p className="text-sm text-muted-foreground">
                    {business.business_description}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}