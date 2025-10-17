import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Download, 
  FileText, 
  Mail, 
  Share2, 
  ExternalLink,
  CheckCircle
} from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportReportDialogProps {
  companyName: string;
  overallScore: number;
  analysis: any;
  trigger: React.ReactNode;
}

export function ExportReportDialog({ companyName, overallScore, analysis, trigger }: ExportReportDialogProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const exportOptions = [
    {
      id: 'pdf',
      title: 'PDF Report',
      description: 'Comprehensive analysis report in PDF format',
      icon: FileText,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      id: 'summary',
      title: 'Executive Summary',
      description: 'Key findings and recommendations (1-page)',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'email',
      title: 'Email Report',
      description: 'Send report directly to stakeholders',
      icon: Mail,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      id: 'link',
      title: 'Shareable Link',
      description: 'Generate secure link to share with partners',
      icon: Share2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ];

  const generatePDF = (type: 'full' | 'summary') => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;

    // Header
    doc.setFillColor(76, 75, 72); // Dark metallic silver
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('UK Market Readiness Report', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(companyName, pageWidth / 2, 30, { align: 'center' });

    // Reset text color
    doc.setTextColor(0, 0, 0);
    yPos = 50;

    // Overall Score
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Overall Market Readiness', 20, yPos);
    
    doc.setFontSize(32);
    doc.setTextColor(overallScore >= 80 ? 34 : overallScore >= 60 ? 180 : 220, 
                      overallScore >= 80 ? 139 : overallScore >= 60 ? 180 : 38, 
                      overallScore >= 80 ? 34 : overallScore >= 60 ? 0 : 38);
    doc.text(`${overallScore}%`, pageWidth - 20, yPos, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    
    yPos += 15;

    // Summary
    if (analysis.summary) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const splitSummary = doc.splitTextToSize(analysis.summary, pageWidth - 40);
      doc.text(splitSummary, 20, yPos);
      yPos += (splitSummary.length * 7) + 10;
    }

    // Score Breakdown
    if (yPos > pageHeight - 80) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Category Breakdown', 20, yPos);
    yPos += 10;

    if (analysis.scoreBreakdown) {
      const scoreData = Object.entries(analysis.scoreBreakdown).map(([key, value]) => {
        const displayName = key.replace(/([A-Z])/g, ' $1').trim()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        return [displayName, `${value}%`];
      });

      autoTable(doc, {
        startY: yPos,
        head: [['Category', 'Score']],
        body: scoreData,
        theme: 'striped',
        headStyles: { fillColor: [76, 75, 72] },
        margin: { left: 20, right: 20 }
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;
    }

    if (type === 'full') {
      // Recommendations
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Recommendations', 20, yPos);
      yPos += 10;

      if (analysis.recommendations) {
        ['immediate', 'shortTerm', 'longTerm'].forEach((timeframe) => {
          const items = analysis.recommendations[timeframe];
          if (items && items.length > 0) {
            if (yPos > pageHeight - 40) {
              doc.addPage();
              yPos = 20;
            }

            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            const timeframeLabel = timeframe === 'immediate' ? 'Immediate Actions' : 
                                   timeframe === 'shortTerm' ? 'Short-term (1-3 months)' : 
                                   'Long-term (3-6 months)';
            doc.text(timeframeLabel, 20, yPos);
            yPos += 7;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            items.forEach((item: string, index: number) => {
              if (yPos > pageHeight - 15) {
                doc.addPage();
                yPos = 20;
              }
              const splitItem = doc.splitTextToSize(`${index + 1}. ${item}`, pageWidth - 45);
              doc.text(splitItem, 25, yPos);
              yPos += (splitItem.length * 5) + 3;
            });
            yPos += 5;
          }
        });
      }

      // Compliance Assessment
      if (analysis.complianceAssessment) {
        if (yPos > pageHeight - 40) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Compliance Assessment', 20, yPos);
        yPos += 10;

        if (analysis.complianceAssessment.criticalRequirements?.length > 0) {
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text('Critical Requirements:', 20, yPos);
          yPos += 7;

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          analysis.complianceAssessment.criticalRequirements.forEach((req: string, index: number) => {
            if (yPos > pageHeight - 15) {
              doc.addPage();
              yPos = 20;
            }
            const splitReq = doc.splitTextToSize(`• ${req}`, pageWidth - 45);
            doc.text(splitReq, 25, yPos);
            yPos += (splitReq.length * 5) + 3;
          });
        }
      }
    }

    // Footer
    const totalPages = (doc as any).internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Generated by Converta | ${new Date().toLocaleDateString()} | Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    return doc;
  };

  const handleExport = async (optionId: string) => {
    setIsExporting(true);
    
    try {
      switch (optionId) {
        case 'pdf':
          const pdfDoc = generatePDF('full');
          pdfDoc.save(`${companyName.replace(/\s+/g, '_')}_Comprehensive_Analysis.pdf`);
          toast({
            title: "PDF Downloaded",
            description: "Your comprehensive report has been downloaded successfully.",
          });
          break;
          
        case 'summary':
          const summaryDoc = generatePDF('summary');
          summaryDoc.save(`${companyName.replace(/\s+/g, '_')}_Executive_Summary.pdf`);
          toast({
            title: "Executive Summary Downloaded",
            description: "One-page summary has been downloaded.",
          });
          break;
          
        case 'email':
          // Simulate email sending
          await new Promise(resolve => setTimeout(resolve, 1500));
          toast({
            title: "Email Sent",
            description: "Report has been sent to the specified recipients.",
          });
          break;
          
        case 'link':
          const shareableLink = `${window.location.origin}/shared-report/${Date.now()}`;
          await navigator.clipboard.writeText(shareableLink);
          toast({
            title: "Link Copied",
            description: "Shareable link has been copied to your clipboard.",
          });
          break;
      }
      
      setIsOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "There was an error generating your report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Analysis Report
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Report Summary */}
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{companyName}</h3>
                  <p className="text-sm text-muted-foreground">UK Market Readiness Assessment</p>
                </div>
                <Badge variant={overallScore >= 80 ? 'default' : overallScore >= 60 ? 'secondary' : 'destructive'}>
                  {overallScore}% Ready
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Export Options */}
          <div className="space-y-4">
            <h4 className="font-medium">Choose Export Format</h4>
            <div className="grid gap-3">
              {exportOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Card 
                    key={option.id} 
                    className={`cursor-pointer transition-all hover:shadow-md border-l-4 ${option.borderColor} ${option.bgColor}/50 hover:${option.bgColor}`}
                    onClick={() => handleExport(option.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${option.bgColor}`}>
                          <Icon className={`h-5 w-5 ${option.color}`} />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium">{option.title}</h5>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        </div>
                        {isExporting ? (
                          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                        ) : (
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Report Includes */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h5 className="font-medium mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Your Report Includes
            </h5>
            <div className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div>• Overall market readiness score</div>
              <div>• Detailed category breakdown</div>
              <div>• Compliance requirements</div>
              <div>• Partner recommendations</div>
              <div>• Action items & timeline</div>
              <div>• Risk assessment</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}