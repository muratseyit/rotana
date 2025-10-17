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

  const handleExport = async (optionId: string) => {
    setIsExporting(true);
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      switch (optionId) {
        case 'pdf':
          toast({
            title: "PDF Generated",
            description: "Your comprehensive report has been downloaded successfully.",
          });
          break;
        case 'summary':
          toast({
            title: "Executive Summary Ready",
            description: "One-page summary has been downloaded.",
          });
          break;
        case 'email':
          toast({
            title: "Email Sent",
            description: "Report has been sent to the specified recipients.",
          });
          break;
        case 'link':
          navigator.clipboard.writeText(`https://businessbridge.com/reports/shared/${Date.now()}`);
          toast({
            title: "Link Copied",
            description: "Shareable link has been copied to your clipboard.",
          });
          break;
      }
      
      setIsOpen(false);
    } catch (error) {
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