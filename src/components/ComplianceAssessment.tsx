import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Shield, CheckCircle, AlertTriangle, FileText, Globe, Users, Lock } from "lucide-react";

export interface ComplianceItem {
  id: string;
  category: string;
  requirement: string;
  description: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
  resources?: string[];
  industries: string[]; // Industries this item applies to
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
  {
    id: "company-registration",
    category: "Legal Structure",
    requirement: "UK Company Registration",
    description: "Register company with Companies House or establish UK subsidiary",
    priority: "high",
    completed: false,
    resources: ["https://www.gov.uk/government/organisations/companies-house"],
    industries: ["all"]
  },
  {
    id: "vat-registration",
    category: "Tax Compliance",
    requirement: "VAT Registration",
    description: "Register for VAT if turnover exceeds £85,000",
    priority: "high",
    completed: false,
    resources: ["https://www.gov.uk/vat-registration"],
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

export function ComplianceAssessment({ complianceStatus, onUpdate, isLoading, selectedIndustry }: ComplianceAssessmentProps) {
  const industryItems = getComplianceItemsForIndustry(selectedIndustry);
  const [items, setItems] = useState<ComplianceItem[]>(
    complianceStatus?.items || industryItems
  );

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
    "Data Protection": Lock,
    "Legal Structure": FileText,
    "Tax Compliance": Globe,
    "Consumer Protection": Shield,
    "Product Standards": CheckCircle,
    "Employment": Users,
    "Marketing": Globe,
    "Financial Services": Shield
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
                          <Badge variant={getPriorityColor(item.priority) as any}>
                            {item.priority}
                          </Badge>
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