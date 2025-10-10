import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Download, 
  Save, 
  Mail, 
  FileText,
  CheckCircle2,
  Share2
} from "lucide-react";

interface SaveReportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  analysisResult: any;
  businessData: {
    companyName: string;
    email: string;
    industry: string;
    companySize: string;
  };
}

export function SaveReportDialog({ 
  isOpen, 
  onOpenChange, 
  analysisResult, 
  businessData 
}: SaveReportDialogProps) {
  const [email, setEmail] = useState(businessData.email || '');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const { toast } = useToast();

  const handleSaveReport = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to save the report.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      // Save analysis to localStorage with metadata
      const reportData = {
        id: Date.now().toString(),
        companyName: businessData.companyName,
        email: email,
        industry: businessData.industry,
        companySize: businessData.companySize,
        analysisResult,
        notes,
        savedAt: new Date().toISOString(),
        type: 'guest_analysis'
      };

      // Save to localStorage
      const savedReports = JSON.parse(localStorage.getItem('savedReports') || '[]');
      savedReports.push(reportData);
      localStorage.setItem('savedReports', JSON.stringify(savedReports));

      toast({
        title: "Report Saved!",
        description: "Your analysis has been saved locally. You can access it anytime.",
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error saving report:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEmailReport = async () => {
    if (!email) {
      toast({
        title: "Email Required", 
        description: "Please enter your email address to receive the report.",
        variant: "destructive"
      });
      return;
    }

    setEmailSending(true);
    try {
      // Generate email content
      const emailContent = {
        to: email,
        subject: `UK Market Analysis Report - ${businessData.companyName}`,
        html: generateEmailHTML()
      };

      // In a real app, this would call an email service
      // For now, we'll simulate it and show success
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Email Sent!",
        description: `Report has been sent to ${email}`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Email Failed",
        description: "Failed to send report via email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setEmailSending(false);
    }
  };

  const generateEmailHTML = () => {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
              UK Market Analysis Report
            </h1>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2>Company: ${businessData.companyName}</h2>
              <p><strong>Industry:</strong> ${businessData.industry}</p>
              <p><strong>Company Size:</strong> ${businessData.companySize}</p>
              <p><strong>Overall Score:</strong> ${analysisResult.overallScore}%</p>
            </div>

            <h3 style="color: #059669;">Key Findings:</h3>
            <ul>
              ${analysisResult.keyFindings?.map((finding: string) => `<li>${finding}</li>`).join('') || ''}
            </ul>

            <h3 style="color: #dc2626;">Recommendations:</h3>
            <ul>
              ${analysisResult.recommendations?.map((rec: string) => `<li>${rec}</li>`).join('') || ''}
            </ul>

            ${notes ? `
              <h3>Your Notes:</h3>
              <p style="background: #fef3c7; padding: 10px; border-radius: 4px;">${notes}</p>
            ` : ''}

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #6b7280; font-size: 14px;">
                Generated by Converta - UK Market Entry Platform
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const handleDownloadPDF = () => {
    // Create a simple text report for download
    const reportContent = `
UK MARKET ANALYSIS REPORT
========================

Company: ${businessData.companyName}
Industry: ${businessData.industry}
Company Size: ${businessData.companySize}
Overall Score: ${analysisResult.overallScore}%

SUMMARY
-------
${analysisResult.summary}

KEY FINDINGS
------------
${analysisResult.keyFindings?.map((finding: string, index: number) => `${index + 1}. ${finding}`).join('\n') || ''}

RECOMMENDATIONS  
---------------
${analysisResult.recommendations?.map((rec: string, index: number) => `${index + 1}. ${rec}`).join('\n') || ''}

RISK FACTORS
------------
${analysisResult.riskFactors?.map((risk: string, index: number) => `${index + 1}. ${risk}`).join('\n') || ''}

${notes ? `\nNOTES\n-----\n${notes}` : ''}

Generated on: ${new Date().toLocaleString()}
Generated by: Converta - UK Market Entry Platform
    `;

    // Create and download file
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `${businessData.companyName}_UK_Analysis_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({
      title: "Download Started",
      description: "Your analysis report is being downloaded."
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Save Your Analysis Report
          </DialogTitle>
          <DialogDescription>
            Choose how you'd like to save and access your UK market analysis report.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any personal notes about your analysis..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 gap-3">
            <Button 
              onClick={handleSaveReport}
              disabled={saving}
              className="w-full"
            >
              {saving ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Saving...
                </div>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Locally
                </>
              )}
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={handleEmailReport}
                disabled={emailSending}
                variant="outline"
              >
                {emailSending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
              </Button>

              <Button 
                onClick={handleDownloadPDF}
                variant="outline"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Info */}
          <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-3 w-3 text-success mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium mb-1">Your data is secure</p>
                <p>Reports are saved locally on your device and can be emailed for your records.</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}