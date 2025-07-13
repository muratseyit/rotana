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
}

const defaultComplianceItems: ComplianceItem[] = [
  {
    id: "gdpr",
    category: "Data Protection",
    requirement: "GDPR Compliance",
    description: "Implement GDPR requirements for data processing and privacy",
    priority: "high",
    completed: false,
    resources: ["https://ico.org.uk/for-organisations/guide-to-data-protection/"]
  },
  {
    id: "company-registration",
    category: "Legal Structure",
    requirement: "UK Company Registration",
    description: "Register company with Companies House or establish UK subsidiary",
    priority: "high",
    completed: false,
    resources: ["https://www.gov.uk/government/organisations/companies-house"]
  },
  {
    id: "vat-registration",
    category: "Tax Compliance",
    requirement: "VAT Registration",
    description: "Register for VAT if turnover exceeds £85,000",
    priority: "high",
    completed: false,
    resources: ["https://www.gov.uk/vat-registration"]
  },
  {
    id: "consumer-rights",
    category: "Consumer Protection",
    requirement: "Consumer Rights Act 2015",
    description: "Comply with UK consumer protection laws",
    priority: "medium",
    completed: false,
    resources: ["https://www.gov.uk/government/publications/consumer-rights-act-2015"]
  },
  {
    id: "product-safety",
    category: "Product Standards",
    requirement: "UK Product Safety Standards",
    description: "Ensure products meet UK/UKCA marking requirements",
    priority: "high",
    completed: false,
    resources: ["https://www.gov.uk/guidance/using-the-ukca-marking"]
  },
  {
    id: "employment-law",
    category: "Employment",
    requirement: "UK Employment Law",
    description: "Comply with UK employment regulations if hiring locally",
    priority: "medium",
    completed: false,
    resources: ["https://www.gov.uk/employment-law"]
  },
  {
    id: "advertising-standards",
    category: "Marketing",
    requirement: "UK Advertising Standards",
    description: "Follow ASA guidelines for advertising and marketing",
    priority: "medium",
    completed: false,
    resources: ["https://www.asa.org.uk/"]
  },
  {
    id: "financial-services",
    category: "Financial Services",
    requirement: "FCA Authorization (if applicable)",
    description: "Obtain FCA authorization if providing financial services",
    priority: "high",
    completed: false,
    resources: ["https://www.fca.org.uk/"]
  }
];

export function ComplianceAssessment({ complianceStatus, onUpdate, isLoading }: ComplianceAssessmentProps) {
  const [items, setItems] = useState<ComplianceItem[]>(
    complianceStatus?.items || defaultComplianceItems
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
          UK Compliance Assessment
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