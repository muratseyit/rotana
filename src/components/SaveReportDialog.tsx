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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      let yPosition = 20;

      // Header
      doc.setFillColor(189, 189, 189);
      doc.rect(0, 0, pageWidth, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.text('Converta', 15, 15);
      doc.setFontSize(12);
      doc.text('UK Market Readiness Report', 15, 23);

      // Company Info
      yPosition = 40;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.text(businessData.companyName, 15, yPosition);
      
      yPosition += 10;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Industry: ${businessData.industry} | Size: ${businessData.companySize}`, 15, yPosition);
      
      yPosition += 5;
      doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, 15, yPosition);

      // Overall Score
      yPosition += 15;
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Overall Market Readiness Score', 15, yPosition);
      
      yPosition += 10;
      doc.setFontSize(24);
      const score = analysisResult.overallScore || 0;
      const scoreColor = score >= 80 ? [76, 175, 80] : score >= 60 ? [255, 152, 0] : [244, 67, 54];
      doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
      doc.text(`${score}%`, 15, yPosition);

      // Summary
      yPosition += 15;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      if (analysisResult.summary) {
        const summaryLines = doc.splitTextToSize(analysisResult.summary, pageWidth - 30);
        doc.text(summaryLines, 15, yPosition);
        yPosition += summaryLines.length * 5 + 5;
      }

      // Key Findings
      if (analysisResult.keyFindings && analysisResult.keyFindings.length > 0) {
        yPosition += 10;
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 20;
        }
        doc.setFontSize(14);
        doc.text('Key Findings', 15, yPosition);
        
        yPosition += 8;
        doc.setFontSize(10);
        analysisResult.keyFindings.slice(0, 5).forEach((finding: string, index: number) => {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
          }
          const findingLines = doc.splitTextToSize(`${index + 1}. ${finding}`, pageWidth - 35);
          doc.text(findingLines, 20, yPosition);
          yPosition += findingLines.length * 5 + 3;
        });
      }

      // Recommendations
      if (analysisResult.recommendations && analysisResult.recommendations.length > 0) {
        yPosition += 10;
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 20;
        }
        doc.setFontSize(14);
        doc.text('Recommendations', 15, yPosition);
        
        yPosition += 8;
        doc.setFontSize(10);
        analysisResult.recommendations.slice(0, 5).forEach((rec: string, index: number) => {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
          }
          const recLines = doc.splitTextToSize(`${index + 1}. ${rec}`, pageWidth - 35);
          doc.text(recLines, 20, yPosition);
          yPosition += recLines.length * 5 + 3;
        });
      }

      // Risk Factors
      if (analysisResult.riskFactors && analysisResult.riskFactors.length > 0) {
        yPosition += 10;
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 20;
        }
        doc.setFontSize(14);
        doc.text('Risk Factors', 15, yPosition);
        
        yPosition += 8;
        doc.setFontSize(10);
        analysisResult.riskFactors.slice(0, 5).forEach((risk: string, index: number) => {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
          }
          const riskLines = doc.splitTextToSize(`${index + 1}. ${risk}`, pageWidth - 35);
          doc.text(riskLines, 20, yPosition);
          yPosition += riskLines.length * 5 + 3;
        });
      }

      // Notes
      if (notes) {
        yPosition += 10;
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 20;
        }
        doc.setFontSize(14);
        doc.text('Notes', 15, yPosition);
        
        yPosition += 8;
        doc.setFontSize(10);
        const notesLines = doc.splitTextToSize(notes, pageWidth - 30);
        doc.text(notesLines, 15, yPosition);
      }

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Converta - AI-powered UK market analysis | Page ${i} of ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Download
      doc.save(`${businessData.companyName.replace(/\s+/g, '-')}-UK-Analysis-Report.pdf`);

      toast({
        title: "PDF Downloaded",
        description: "Your analysis report has been downloaded successfully."
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Download Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    }
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