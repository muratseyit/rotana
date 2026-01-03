import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, CheckCircle, AlertTriangle, FileText, Globe, Users, Lock, Link as LinkIcon, Calendar } from "lucide-react";

export interface ComplianceItem {
  id: string;
  category: string;
  requirement: string;
  description: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
  resources?: string[];
  industries: string[]; // Industries this item applies to
  law?: string; // e.g., GDPR, UKCA, MHRA
  deadline?: string; // ISO date string
  partner?: { name: string; url: string };
}

export interface ComplianceStatus {
  overallScore: number;
  items: ComplianceItem[];
  lastUpdated: string;
}

interface ComplianceAssessmentProps {
  complianceStatus?: ComplianceStatus;
  onUpdate: (status: ComplianceStatus) => void;
  isLoading?: boolean;
  selectedIndustry: string; // The industry selected in the business form
  companyName?: string;
  businessDescription?: string;
  websiteUrl?: string | null;
}

const industrySpecificCompliance: Record<string, ComplianceItem[]> = {
  "Technology & Software": [
    {
      id: "gdpr-tech",
      category: "Data Protection",
      requirement: "GDPR & Data Protection",
      description: "Implement GDPR requirements for data processing, privacy policies, and user consent",
      priority: "high",
      completed: false,
      resources: ["https://ico.org.uk/for-organisations/guide-to-data-protection/"],
      industries: ["Technology & Software"]
    },
    {
      id: "software-licensing",
      category: "Intellectual Property",
      requirement: "Software Licensing Compliance",
      description: "Ensure proper software licensing and open source compliance",
      priority: "medium",
      completed: false,
      resources: ["https://www.gov.uk/government/publications/intellectual-property-law"],
      industries: ["Technology & Software"]
    },
    {
      id: "cybersecurity-standards",
      category: "Security",
      requirement: "Cyber Essentials Certification",
      description: "Obtain Cyber Essentials certification for government contracts",
      priority: "medium",
      completed: false,
      resources: ["https://www.ncsc.gov.uk/cyberessentials/overview"],
      industries: ["Technology & Software"]
    }
  ],
  "Financial Services": [
    {
      id: "fca-authorization",
      category: "Financial Regulation",
      requirement: "FCA Authorization",
      description: "Obtain FCA authorization for financial services activities",
      priority: "high",
      completed: false,
      resources: ["https://www.fca.org.uk/"],
      industries: ["Financial Services"]
    },
    {
      id: "anti-money-laundering",
      category: "Financial Regulation",
      requirement: "Anti-Money Laundering (AML)",
      description: "Implement AML procedures and customer due diligence",
      priority: "high",
      completed: false,
      resources: ["https://www.fca.org.uk/firms/financial-crime/money-laundering-regulations"],
      industries: ["Financial Services"]
    },
    {
      id: "capital-requirements",
      category: "Financial Regulation",
      requirement: "Capital Requirements",
      description: "Meet minimum capital and liquidity requirements",
      priority: "high",
      completed: false,
      resources: ["https://www.bankofengland.co.uk/prudential-regulation"],
      industries: ["Financial Services"]
    }
  ],
  "Healthcare & Medical": [
    {
      id: "mhra-approval",
      category: "Medical Regulation",
      requirement: "MHRA Medical Device Approval",
      description: "Obtain MHRA approval for medical devices and pharmaceuticals",
      priority: "high",
      completed: false,
      resources: ["https://www.gov.uk/government/organisations/medicines-and-healthcare-products-regulatory-agency"],
      industries: ["Healthcare & Medical"]
    },
    {
      id: "gmp-standards",
      category: "Quality Standards",
      requirement: "Good Manufacturing Practice (GMP)",
      description: "Comply with GMP standards for pharmaceutical manufacturing",
      priority: "high",
      completed: false,
      resources: ["https://www.gov.uk/guidance/good-manufacturing-practice-and-good-distribution-practice"],
      industries: ["Healthcare & Medical"]
    },
    {
      id: "clinical-trials",
      category: "Medical Regulation",
      requirement: "Clinical Trial Regulations",
      description: "Follow UK clinical trial regulations and ethics approval",
      priority: "medium",
      completed: false,
      resources: ["https://www.gov.uk/guidance/clinical-trials-for-medicines"],
      industries: ["Healthcare & Medical"]
    }
  ],
  "Food & Beverage": [
    {
      id: "food-safety",
      category: "Food Safety",
      requirement: "Food Safety Standards",
      description: "Comply with UK food safety and hygiene regulations",
      priority: "high",
      completed: false,
      resources: ["https://www.food.gov.uk/business-guidance"],
      industries: ["Food & Beverage"]
    },
    {
      id: "food-labelling",
      category: "Food Safety",
      requirement: "Food Labelling Requirements",
      description: "Ensure proper food labelling and allergen information",
      priority: "high",
      completed: false,
      resources: ["https://www.food.gov.uk/business-guidance/food-labelling"],
      industries: ["Food & Beverage"]
    },
    {
      id: "alcohol-licensing",
      category: "Licensing",
      requirement: "Alcohol Licensing (if applicable)",
      description: "Obtain appropriate alcohol licenses for production or sale",
      priority: "medium",
      completed: false,
      resources: ["https://www.gov.uk/guidance/alcohol-licensing"],
      industries: ["Food & Beverage"]
    }
  ],
  "Manufacturing": [
    {
      id: "ce-ukca-marking",
      category: "Product Standards",
      requirement: "CE/UKCA Marking",
      description: "Ensure products meet UK conformity assessment marking requirements",
      priority: "high",
      completed: false,
      resources: ["https://www.gov.uk/guidance/using-the-ukca-marking"],
      industries: ["Manufacturing"]
    },
    {
      id: "iso-quality",
      category: "Quality Standards",
      requirement: "ISO Quality Management",
      description: "Implement ISO 9001 quality management system",
      priority: "medium",
      completed: false,
      resources: ["https://www.iso.org/iso-9001-quality-management.html"],
      industries: ["Manufacturing"]
    },
    {
      id: "health-safety-work",
      category: "Health & Safety",
      requirement: "Health & Safety at Work Act",
      description: "Comply with UK workplace health and safety regulations",
      priority: "high",
      completed: false,
      resources: ["https://www.hse.gov.uk/legislation/hswa.htm"],
      industries: ["Manufacturing"]
    }
  ],
  "E-commerce & Retail": [
    {
      id: "distance-selling",
      category: "Consumer Protection",
      requirement: "Distance Selling Regulations",
      description: "Comply with UK distance selling and consumer contract regulations",
      priority: "high",
      completed: false,
      resources: ["https://www.gov.uk/online-and-distance-selling-for-businesses"],
      industries: ["E-commerce & Retail"]
    },
    {
      id: "payment-processing",
      category: "Payment Compliance",
      requirement: "PCI DSS Compliance",
      description: "Ensure secure payment processing and PCI DSS compliance",
      priority: "high",
      completed: false,
      resources: ["https://www.pcisecuritystandards.org/"],
      industries: ["E-commerce & Retail"]
    },
    {
      id: "product-liability",
      category: "Product Standards",
      requirement: "Product Liability Insurance",
      description: "Obtain appropriate product liability insurance coverage",
      priority: "medium",
      completed: false,
      resources: ["https://www.gov.uk/product-liability"],
      industries: ["E-commerce & Retail"]
    }
  ]
};

// Common compliance items that apply to all industries
const commonComplianceItems: ComplianceItem[] = [
  // Legal and Regulatory Essentials
  {
    id: "uk-eori",
    category: "Customs & Trade",
    requirement: "UK EORI Number",
    description: "Economic Operator Registration and Identification number required for customs declarations when importing/exporting goods to/from the UK",
    priority: "high",
    completed: false,
    resources: ["https://www.gov.uk/eori"],
    industries: ["all"]
  },
  {
    id: "company-registration",
    category: "Legal Structure",
    requirement: "UK Company Registration",
    description: "Register company with Companies House or establish UK subsidiary/branch",
    priority: "high",
    completed: false,
    resources: ["https://www.gov.uk/government/organisations/companies-house"],
    industries: ["all"]
  },
  {
    id: "vat-registration",
    category: "Tax Compliance",
    requirement: "VAT Registration",
    description: "Required if UK taxable turnover exceeds £90,000 (2025 threshold) or if storing goods in the UK",
    priority: "high",
    completed: false,
    resources: ["https://www.gov.uk/vat-registration"],
    industries: ["all"]
  },
  {
    id: "responsible-person",
    category: "Product Compliance",
    requirement: "UK Responsible Person / Importer of Record",
    description: "Mandatory for products requiring regulatory compliance (cosmetics, electronics, medical devices). Must be UK-based.",
    priority: "high",
    completed: false,
    resources: ["https://www.gov.uk/guidance/placing-manufactured-goods-on-the-uk-market"],
    industries: ["all"]
  },
  {
    id: "hs-code",
    category: "Customs & Trade",
    requirement: "Trade Tariff Classification (HS Code)",
    description: "Determine correct Harmonised System codes for your products - determines duty rates and import documentation",
    priority: "high",
    completed: false,
    resources: ["https://www.gov.uk/trade-tariff"],
    industries: ["all"]
  },
  // Customs and Logistics
  {
    id: "customs-declarations",
    category: "Customs & Trade",
    requirement: "Customs Declarations (CDS)",
    description: "Register for Customs Declaration Service and set up process for import/export declarations",
    priority: "high",
    completed: false,
    resources: ["https://www.gov.uk/guidance/customs-declaration-service"],
    industries: ["all"]
  },
  {
    id: "origin-documentation",
    category: "Customs & Trade",
    requirement: "Origin Documentation (EUR.1 / Certificate of Origin)",
    description: "Obtain certificates for preferential tariffs under UK-Turkey FTA and other trade agreements",
    priority: "medium",
    completed: false,
    resources: ["https://www.gov.uk/guidance/get-proof-of-origin-for-your-goods"],
    industries: ["all"]
  },
  {
    id: "incoterms",
    category: "Customs & Trade",
    requirement: "Incoterms Agreement",
    description: "Define responsibility for transport, insurance, and duties in all trade contracts",
    priority: "medium",
    completed: false,
    resources: ["https://iccwbo.org/business-solutions/incoterms-rules/"],
    industries: ["all"]
  },
  // Product Standards
  {
    id: "ukca-marking",
    category: "Product Compliance",
    requirement: "UKCA Marking",
    description: "UK Conformity Assessed marking required for most manufactured goods sold in Great Britain",
    priority: "high",
    completed: false,
    resources: ["https://www.gov.uk/guidance/using-the-ukca-marking"],
    industries: ["all"]
  },
  {
    id: "labelling-compliance",
    category: "Product Compliance",
    requirement: "UK Labelling Requirements",
    description: "Country of origin, manufacturer details, safety warnings, and conformity marks must be displayed",
    priority: "high",
    completed: false,
    resources: ["https://www.gov.uk/product-safety-for-businesses"],
    industries: ["all"]
  },
  // Financial Setup
  {
    id: "uk-bank-account",
    category: "Financial Setup",
    requirement: "UK Bank Account or Payment Gateway",
    description: "Set up UK banking for transactions, refunds, and marketplace payouts",
    priority: "medium",
    completed: false,
    resources: ["https://www.gov.uk/business-bank-account"],
    industries: ["all"]
  },
  {
    id: "customs-duty-vat",
    category: "Tax Compliance",
    requirement: "Customs Duty & Import VAT Setup",
    description: "Understand duty rates based on HS codes and origin. Set up deferment account if needed.",
    priority: "high",
    completed: false,
    resources: ["https://www.gov.uk/guidance/customs-duties-and-taxes-on-imports"],
    industries: ["all"]
  },
  // General
  {
    id: "gdpr-compliance",
    category: "Data Protection",
    requirement: "GDPR & UK Data Protection",
    description: "Register with ICO and implement UK GDPR requirements for data processing",
    priority: "high",
    completed: false,
    resources: ["https://ico.org.uk/for-organisations/guide-to-data-protection/"],
    industries: ["all"]
  },
  {
    id: "employment-law",
    category: "Employment",
    requirement: "UK Employment Law",
    description: "Comply with UK employment regulations if hiring locally",
    priority: "medium",
    completed: false,
    resources: ["https://www.gov.uk/employment-law"],
    industries: ["all"]
  },
  {
    id: "advertising-standards",
    category: "Marketing",
    requirement: "UK Advertising Standards",
    description: "Follow ASA guidelines for advertising and marketing",
    priority: "medium",
    completed: false,
    resources: ["https://www.asa.org.uk/"],
    industries: ["all"]
  }
];

const getComplianceItemsForIndustry = (industry: string): ComplianceItem[] => {
  const industryItems = industrySpecificCompliance[industry] || [];
  return [...commonComplianceItems, ...industryItems];
};

export function ComplianceAssessment({ complianceStatus, onUpdate, isLoading, selectedIndustry, companyName, businessDescription, websiteUrl }: ComplianceAssessmentProps) {
  const industryItems = getComplianceItemsForIndustry(selectedIndustry);
  const [items, setItems] = useState<ComplianceItem[]>(
    complianceStatus?.items || industryItems
  );

  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [catalogText, setCatalogText] = useState("");
  const [companyNameInput, setCompanyNameInput] = useState(companyName || "");
  const [businessDescriptionInput, setBusinessDescriptionInput] = useState(businessDescription || "");
  const [websiteUrlInput, setWebsiteUrlInput] = useState(websiteUrl || "");

  const toInputDate = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const addDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString();
  };

  const handleDeadlineChange = (itemId: string, dateStr: string) => {
    const iso = dateStr ? new Date(dateStr + 'T00:00:00Z').toISOString() : undefined;
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, deadline: iso } : i));
  };

  const generateChecklist = async () => {
    if (!companyNameInput && !businessDescriptionInput && !catalogText) {
      toast({ title: "Missing context", description: "Provide company info or catalog to generate.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-compliance-checklist', {
        body: {
          business: {
            companyName: companyNameInput || companyName || "",
            businessDescription: businessDescriptionInput || businessDescription || "",
            industry: selectedIndustry,
            websiteUrl: websiteUrlInput || websiteUrl || null,
          },
          catalogText,
        }
      });
      if (error) throw error;

      const generatedItems = (data.items || []).map((it: any) => {
        const deadline = it.deadlineDays ? addDays(it.deadlineDays) : undefined;
        const mapped: ComplianceItem = {
          id: it.id || `${it.category}-${it.law}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          category: it.category,
          requirement: it.requirement,
          description: it.description,
          priority: it.priority,
          completed: false,
          resources: it.resources,
          industries: [selectedIndustry],
          law: it.law,
          partner: it.partner,
          deadline,
        };
        return mapped;
      });

      setItems(generatedItems);
      toast({ title: "Checklist generated", description: `Created ${generatedItems.length} items tailored to your profile.` });
    } catch (e: any) {
      console.error('generate checklist error', e);
      toast({ title: "Generation failed", description: e?.message || "Could not generate checklist.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const calculateScore = (itemList: ComplianceItem[]) => {
    const totalWeight = itemList.reduce((sum, item) => {
      return sum + (item.priority === "high" ? 3 : item.priority === "medium" ? 2 : 1);
    }, 0);
    
    const completedWeight = itemList.reduce((sum, item) => {
      if (item.completed) {
        return sum + (item.priority === "high" ? 3 : item.priority === "medium" ? 2 : 1);
      }
      return sum;
    }, 0);
    
    return Math.round((completedWeight / totalWeight) * 100);
  };

  const toggleItem = (itemId: string) => {
    const newItems = items.map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    setItems(newItems);
  };

  const handleSave = () => {
    const newStatus: ComplianceStatus = {
      overallScore: calculateScore(items),
      items,
      lastUpdated: new Date().toISOString()
    };
    onUpdate(newStatus);
  };

  const overallScore = calculateScore(items);
  const completedCount = items.filter(item => item.completed).length;
  
  const categoryIcons = {
    "Customs & Trade": Globe,
    "Legal Structure": FileText,
    "Tax Compliance": Globe,
    "Product Compliance": CheckCircle,
    "Financial Setup": Shield,
    "Data Protection": Lock,
    "Consumer Protection": Shield,
    "Product Standards": CheckCircle,
    "Employment": Users,
    "Marketing": Globe,
    "Financial Services": Shield,
    "Financial Regulation": Shield,
    "Medical Regulation": Shield,
    "Quality Standards": CheckCircle,
    "Food Safety": Shield,
    "Licensing": FileText,
    "Intellectual Property": FileText,
    "Security": Lock,
    "Health & Safety": Shield,
    "Payment Compliance": Lock
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "outline";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          UK Compliance Assessment - {selectedIndustry}
        </CardTitle>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-primary">
            {overallScore}% Complete
          </div>
          <Badge variant={overallScore >= 80 ? "default" : overallScore >= 60 ? "secondary" : "destructive"}>
            {completedCount} of {items.length} items
          </Badge>
        </div>
        <Progress value={overallScore} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Generator controls (optional overrides) */}
        <div className="space-y-3 p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">AI-generated UK checklist</h3>
            <Button size="sm" onClick={generateChecklist} disabled={isGenerating}>
              {isGenerating ? "Generating..." : "Generate from Profile & Catalog"}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              placeholder="Company name (auto)"
              value={companyNameInput}
              onChange={(e) => setCompanyNameInput(e.target.value)}
            />
            <Input
              placeholder="Website URL (optional)"
              value={websiteUrlInput || ""}
              onChange={(e) => setWebsiteUrlInput(e.target.value)}
            />
            <Input
              placeholder="Industry (auto)"
              value={selectedIndustry}
              readOnly
            />
          </div>
          <Textarea
            placeholder="Paste catalog items or product summary (optional)"
            value={catalogText}
            onChange={(e) => setCatalogText(e.target.value)}
            rows={3}
          />
          <Textarea
            placeholder="Business description (auto)"
            value={businessDescriptionInput}
            onChange={(e) => setBusinessDescriptionInput(e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-4">
          {Object.entries(
            items.reduce((acc, item) => {
              if (!acc[item.category]) acc[item.category] = [];
              acc[item.category].push(item);
              return acc;
            }, {} as Record<string, ComplianceItem[]>)
          ).map(([category, categoryItems]) => {
            const Icon = categoryIcons[category as keyof typeof categoryIcons] || FileText;
            return (
              <div key={category} className="space-y-3">
                <h3 className="flex items-center gap-2 font-semibold text-lg">
                  <Icon className="h-4 w-4" />
                  {category}
                </h3>
                <div className="space-y-3 pl-6">
                  {categoryItems.map((item) => (
                    <div key={item.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        id={item.id}
                        checked={item.completed}
                        onCheckedChange={() => toggleItem(item.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <label 
                            htmlFor={item.id} 
                            className={`font-medium cursor-pointer ${item.completed ? 'line-through text-muted-foreground' : ''}`}
                          >
                            {item.requirement}
                          </label>
                          <div className="flex items-center gap-2">
                            {item.law && (
                              <Badge variant="outline">{item.law}</Badge>
                            )}
                            <Badge variant={getPriorityColor(item.priority) as any}>
                              {item.priority}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                        {item.resources && (
                          <div className="flex flex-wrap gap-2">
                            {item.resources.map((resource, index) => (
                              <a 
                                key={index}
                                href={resource}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline"
                              >
                                📖 Official Guide
                              </a>
                            ))}
                          </div>
                        )}

                        <div className="flex flex-col md:flex-row md:items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm">Due date</span>
                            <Input
                              type="date"
                              className="h-8 w-[160px]"
                              value={toInputDate(item.deadline)}
                              onChange={(e) => handleDeadlineChange(item.id, e.target.value)}
                            />
                          </div>
                          {item.partner?.url && (
                            <a
                              href={item.partner.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                            >
                              <LinkIcon className="h-3 w-3" /> Get partner help{item.partner?.name ? `: ${item.partner.name}` : ''}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <p className="text-sm text-muted-foreground">
            This is a general compliance checklist. Consult with UK legal professionals for specific requirements relevant to your business.
          </p>
        </div>

        <Button onClick={handleSave} className="w-full" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Compliance Status"}
        </Button>
      </CardContent>
    </Card>
  );
}