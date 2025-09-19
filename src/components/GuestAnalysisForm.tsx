import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Building, FileText, Globe, Users, Briefcase, Loader2, ArrowRight } from "lucide-react";

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

interface GuestAnalysisData {
  companyName: string;
  businessDescription: string;
  industry: string;
  companySize: string;
  websiteUrl: string;
  email: string;
}

export function GuestAnalysisForm() {
  const [formData, setFormData] = useState<GuestAnalysisData>({
    companyName: "",
    businessDescription: "",
    industry: "",
    companySize: "",
    websiteUrl: "",
    email: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.companyName || !formData.businessDescription || !formData.industry || 
        !formData.companySize || !formData.email) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
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
          Get Your Free AI Business Analysis
        </CardTitle>
        <CardDescription>
          Receive comprehensive insights and recommendations for your business
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <span className="text-sm">📧</span>
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Company Name *
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
              Business Description *
            </Label>
            <Textarea
              id="businessDescription"
              placeholder="Describe your business, products/services, and target market..."
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
                Industry *
              </Label>
              <Select 
                value={formData.industry} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
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
                  <SelectValue placeholder="Select size" />
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

          <div className="space-y-2">
            <Label htmlFor="websiteUrl" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Website URL (Optional)
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
              What you'll get:
            </div>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Comprehensive AI business analysis</li>
              <li>• UK market readiness score</li>
              <li>• Business recommendations and insights</li>
              <li>• Instant results</li>
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
                Processing Analysis...
              </>
            ) : (
              <>
                Get Free Analysis
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}