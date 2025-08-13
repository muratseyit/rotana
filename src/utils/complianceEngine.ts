export interface ComplianceRecommendation {
  recommendedCompanyType: string;
  taxObligations: string[];
  complianceCalendar: ComplianceEvent[];
  requiredRegistrations: string[];
  estimatedSetupCost: string;
  reasoning: string;
}

export interface ComplianceEvent {
  title: string;
  description: string;
  deadline: string;
  frequency: 'once' | 'monthly' | 'quarterly' | 'annually';
  priority: 'high' | 'medium' | 'low';
  category: 'tax' | 'filing' | 'registration' | 'compliance';
}

export const generateComplianceRecommendation = (businessData: any): ComplianceRecommendation => {
  const revenue = businessData.annualRevenue;
  const companySize = businessData.companySize;
  const industry = businessData.industry;
  const hasOnlineStore = businessData.hasOnlineStore;

  // Determine company type based on business profile
  let recommendedCompanyType = "Private Limited Company";
  let reasoning = "Standard choice for most SMEs entering new markets";

  if (revenue === "0-50k" && companySize === "1-10") {
    recommendedCompanyType = "Private Limited Company";
    reasoning = "Ideal for small businesses with limited liability protection and tax efficiency";
  } else if (revenue === "5m+" || companySize === "200+") {
    recommendedCompanyType = "Public Limited Company (PLC)";
    reasoning = "Suitable for larger businesses planning significant growth and potential public investment";
  }

  // Generate tax obligations
  const taxObligations = [
    "Corporation Tax on profits",
    "PAYE (if employing staff)",
    "National Insurance contributions"
  ];

  if (hasOnlineStore || revenue !== "0-50k") {
    taxObligations.push("VAT Registration (if turnover threshold exceeded)");
  }

  if (industry === "Manufacturing" || industry === "Technology") {
    taxObligations.push("Import/Export duties (if applicable)");
  }

  // Generate compliance calendar
  const complianceCalendar: ComplianceEvent[] = [
    {
      title: "Company Registration",
      description: "Register company with relevant authorities",
      deadline: "Before trading begins",
      frequency: 'once',
      priority: 'high',
      category: 'registration'
    },
    {
      title: "Tax Registration",
      description: "Register for relevant tax obligations",
      deadline: "Within 3 months of incorporation",
      frequency: 'once',
      priority: 'high',
      category: 'tax'
    },
    {
      title: "Annual Return",
      description: "Submit annual company return",
      deadline: "Annually",
      frequency: 'annually',
      priority: 'medium',
      category: 'filing'
    },
    {
      title: "Tax Return",
      description: "Submit annual tax return",
      deadline: "12 months after year end",
      frequency: 'annually',
      priority: 'high',
      category: 'tax'
    }
  ];

  if (hasOnlineStore) {
    complianceCalendar.push({
      title: "VAT Return",
      description: "Submit quarterly VAT return (if VAT registered)",
      deadline: "Quarterly",
      frequency: 'quarterly',
      priority: 'high',
      category: 'tax'
    });
  }

  // Required registrations
  const requiredRegistrations = [
    "Company registration",
    "Tax registration",
    "Business license (if required)"
  ];

  if (industry === "Food & Beverage") {
    requiredRegistrations.push("Food safety registration");
  }

  if (industry === "Healthcare") {
    requiredRegistrations.push("Healthcare regulatory approval");
  }

  // Estimated setup cost
  let estimatedSetupCost = "$1,000 - $3,000";
  if (industry === "Healthcare" || industry === "Financial Services") {
    estimatedSetupCost = "$5,000 - $15,000";
  } else if (recommendedCompanyType === "Public Limited Company (PLC)") {
    estimatedSetupCost = "$10,000 - $25,000";
  }

  return {
    recommendedCompanyType,
    taxObligations,
    complianceCalendar,
    requiredRegistrations,
    estimatedSetupCost,
    reasoning
  };
};