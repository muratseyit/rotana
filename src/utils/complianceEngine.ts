export interface ComplianceRecommendation {
  recommendedCompanyType: string;
  taxObligations: string[];
  complianceCalendar: ComplianceEvent[];
  requiredRegistrations: string[];
  estimatedSetupCost: string;
  reasoning: string;
  customsRequirements?: CustomsRequirement[];
  productStandards?: ProductStandard[];
}

export interface ComplianceEvent {
  title: string;
  description: string;
  deadline: string;
  frequency: 'once' | 'monthly' | 'quarterly' | 'annually';
  priority: 'high' | 'medium' | 'low';
  category: 'tax' | 'filing' | 'registration' | 'compliance' | 'customs' | 'trade';
}

export interface CustomsRequirement {
  id: string;
  name: string;
  description: string;
  required: boolean;
  applicableTo: 'all' | 'goods' | 'services' | 'manufacturer' | 'reseller';
  estimatedCost?: string;
  timeToComplete?: string;
  link?: string;
}

export interface ProductStandard {
  id: string;
  name: string;
  description: string;
  applicableIndustries: string[];
  required: boolean;
  link?: string;
}

// UK Export/Import Essential Requirements
export const UK_CUSTOMS_REQUIREMENTS: CustomsRequirement[] = [
  // Legal and Regulatory Essentials
  {
    id: 'uk-eori',
    name: 'UK EORI Number',
    description: 'Economic Operator Registration and Identification number required for customs declarations when importing/exporting goods to/from the UK',
    required: true,
    applicableTo: 'goods',
    estimatedCost: 'Free',
    timeToComplete: '1-5 working days',
    link: 'https://www.gov.uk/eori'
  },
  {
    id: 'companies-house',
    name: 'UK Company Registration (Companies House)',
    description: 'Required if you plan to have a UK presence, open a warehouse, or sell directly (B2C/B2B)',
    required: false,
    applicableTo: 'all',
    estimatedCost: '£12-£100',
    timeToComplete: '24 hours - 1 week',
    link: 'https://www.gov.uk/government/organisations/companies-house'
  },
  {
    id: 'vat-registration',
    name: 'UK VAT Registration',
    description: 'Required if taxable turnover exceeds £90,000 (2025 threshold) or if you store goods in the UK',
    required: false,
    applicableTo: 'all',
    estimatedCost: 'Free',
    timeToComplete: '1-4 weeks',
    link: 'https://www.gov.uk/vat-registration'
  },
  {
    id: 'responsible-person',
    name: 'UK Responsible Person / Importer of Record',
    description: 'Mandatory for products requiring regulatory compliance (e.g. cosmetics, electronics, medical devices). Must be UK-based entity.',
    required: true,
    applicableTo: 'goods',
    estimatedCost: '£500-£5,000/year',
    timeToComplete: '1-4 weeks',
    link: 'https://www.gov.uk/guidance/placing-manufactured-goods-on-the-uk-market'
  },
  {
    id: 'hs-code',
    name: 'Trade Tariff Classification (HS Code)',
    description: 'Harmonised System codes determine duty rates and required import documentation for every product',
    required: true,
    applicableTo: 'goods',
    estimatedCost: 'Free (self-classification) or £500+ (professional)',
    timeToComplete: '1-7 days',
    link: 'https://www.gov.uk/trade-tariff'
  },
  // Customs and Logistics
  {
    id: 'customs-declarations',
    name: 'Commodity Codes & Customs Declarations',
    description: 'Identify goods, calculate duties, and declare to HMRC via CDS (Customs Declaration Service) system',
    required: true,
    applicableTo: 'goods',
    estimatedCost: '£20-£100 per declaration (agent fees)',
    timeToComplete: 'Per shipment',
    link: 'https://www.gov.uk/guidance/customs-declaration-service'
  },
  {
    id: 'origin-documentation',
    name: 'Origin Documentation (EUR.1, Certificate of Origin)',
    description: 'Needed for preferential tariffs under trade agreements (e.g. UK–Turkey Free Trade Agreement)',
    required: false,
    applicableTo: 'goods',
    estimatedCost: '£20-£50 per certificate',
    timeToComplete: '1-3 days',
    link: 'https://www.gov.uk/guidance/get-proof-of-origin-for-your-goods'
  },
  {
    id: 'commercial-invoice',
    name: 'Commercial Invoice & Packing List',
    description: 'Standard customs documentation showing full shipment details required for every shipment',
    required: true,
    applicableTo: 'goods',
    estimatedCost: 'Free (internal)',
    timeToComplete: 'Per shipment'
  },
  {
    id: 'import-licenses',
    name: 'Import Licenses',
    description: 'Required for restricted items like chemicals, food, plants, arms, dual-use goods',
    required: false,
    applicableTo: 'goods',
    estimatedCost: '£0-£500+',
    timeToComplete: '2-8 weeks',
    link: 'https://www.gov.uk/guidance/import-controls'
  },
  {
    id: 'incoterms',
    name: 'Incoterms Agreement',
    description: 'International Commercial Terms defining who is responsible for transport, insurance, duties in every trade contract',
    required: true,
    applicableTo: 'goods',
    estimatedCost: 'Free (contractual)',
    timeToComplete: 'Per contract'
  },
  // Financial Setup
  {
    id: 'uk-bank-account',
    name: 'UK Bank Account or Payment Gateway',
    description: 'Needed for transactions, refunds, and marketplace payouts. Beneficial for B2C/B2B operations',
    required: false,
    applicableTo: 'all',
    estimatedCost: '£0-£30/month',
    timeToComplete: '2-6 weeks',
    link: 'https://www.gov.uk/business-bank-account'
  },
  {
    id: 'vat-representative',
    name: 'VAT Representative or Fiscal Agent',
    description: 'For non-UK businesses that must file VAT but have no UK presence',
    required: false,
    applicableTo: 'all',
    estimatedCost: '£1,000-£5,000/year',
    timeToComplete: '1-2 weeks'
  },
  {
    id: 'customs-duty-vat',
    name: 'Customs Duty and Import VAT Payments',
    description: 'Duties depend on HS code, origin country, and trade agreements. Must be paid on every import',
    required: true,
    applicableTo: 'goods',
    estimatedCost: 'Variable (0-20%+ of goods value)',
    timeToComplete: 'Per shipment'
  }
];

// UK Product Standards and Compliance
export const UK_PRODUCT_STANDARDS: ProductStandard[] = [
  {
    id: 'ukca-marking',
    name: 'UKCA Marking',
    description: 'UK Conformity Assessed marking required for most manufactured goods sold in Great Britain (machinery, electronics, PPE, toys, etc.)',
    applicableIndustries: ['Manufacturing', 'Technology', 'Retail', 'E-commerce'],
    required: true,
    link: 'https://www.gov.uk/guidance/using-the-ukca-marking'
  },
  {
    id: 'ce-marking',
    name: 'CE Marking (Northern Ireland)',
    description: 'CE marking still accepted in Northern Ireland under the Northern Ireland Protocol',
    applicableIndustries: ['Manufacturing', 'Technology', 'Retail'],
    required: false,
    link: 'https://www.gov.uk/guidance/ce-marking'
  },
  {
    id: 'labelling-compliance',
    name: 'Labelling Compliance',
    description: 'Country of origin, manufacturer details, safety warnings, and conformity marks must be displayed on all consumer products',
    applicableIndustries: ['Manufacturing', 'Retail', 'E-commerce', 'Food & Beverage'],
    required: true,
    link: 'https://www.gov.uk/product-safety-for-businesses'
  },
  {
    id: 'reach-compliance',
    name: 'UK REACH Compliance',
    description: 'Registration, Evaluation, Authorisation and Restriction of Chemicals for chemical safety',
    applicableIndustries: ['Manufacturing', 'Chemicals', 'Cosmetics'],
    required: true,
    link: 'https://www.hse.gov.uk/reach/'
  },
  {
    id: 'rohs-compliance',
    name: 'RoHS Compliance',
    description: 'Restriction of Hazardous Substances in electrical and electronic equipment',
    applicableIndustries: ['Technology', 'Electronics', 'Manufacturing'],
    required: true,
    link: 'https://www.gov.uk/guidance/rohs-compliance-and-guidance'
  },
  {
    id: 'fsa-registration',
    name: 'Food Standards Agency (FSA) Registration',
    description: 'Required for food exporters, manufacturers, or distributors',
    applicableIndustries: ['Food & Beverage'],
    required: true,
    link: 'https://www.food.gov.uk/business-guidance'
  },
  {
    id: 'mhra-approval',
    name: 'MHRA Approval',
    description: 'Medicines and Healthcare products Regulatory Agency approval for medical and pharmaceutical goods',
    applicableIndustries: ['Healthcare', 'Pharmaceuticals', 'Medical Devices'],
    required: true,
    link: 'https://www.gov.uk/government/organisations/medicines-and-healthcare-products-regulatory-agency'
  },
  {
    id: 'defra-approval',
    name: 'DEFRA Approval',
    description: 'Department for Environment, Food & Rural Affairs approval for agricultural and animal products',
    applicableIndustries: ['Agriculture', 'Food & Beverage', 'Pet Products'],
    required: true,
    link: 'https://www.gov.uk/government/organisations/department-for-environment-food-rural-affairs'
  }
];

// Helper function to get applicable customs requirements based on business type
export const getCustomsRequirements = (businessType: 'manufacturer' | 'reseller' | 'both' | 'services'): CustomsRequirement[] => {
  if (businessType === 'services') {
    return UK_CUSTOMS_REQUIREMENTS.filter(req => req.applicableTo === 'all' || req.applicableTo === 'services');
  }
  
  return UK_CUSTOMS_REQUIREMENTS.filter(req => {
    if (req.applicableTo === 'all' || req.applicableTo === 'goods') return true;
    if (businessType === 'both') return true;
    return req.applicableTo === businessType;
  });
};

// Helper function to get applicable product standards based on industry
export const getProductStandards = (industry: string): ProductStandard[] => {
  return UK_PRODUCT_STANDARDS.filter(std => 
    std.applicableIndustries.some(ind => 
      industry.toLowerCase().includes(ind.toLowerCase()) || 
      ind.toLowerCase().includes(industry.toLowerCase())
    )
  );
};

export const generateComplianceRecommendation = (businessData: any): ComplianceRecommendation => {
  const revenue = businessData.annualRevenue;
  const companySize = businessData.companySize;
  const industry = businessData.industry;
  const hasOnlineStore = businessData.hasOnlineStore;
  const businessType = businessData.businessType || 'both'; // manufacturer, reseller, both, services
  const sellsGoods = businessData.sellsGoods !== false; // Default to true for backward compatibility

  // Determine company type based on business profile
  let recommendedCompanyType = "Private Limited Company (Ltd)";
  let reasoning = "Standard choice for most SMEs entering the UK market with limited liability protection";

  if (revenue === "0-50k" && companySize === "1-10") {
    recommendedCompanyType = "Private Limited Company (Ltd)";
    reasoning = "Ideal for small businesses with limited liability protection and tax efficiency. Lower administrative burden.";
  } else if (revenue === "5m+" || companySize === "200+") {
    recommendedCompanyType = "Public Limited Company (PLC)";
    reasoning = "Suitable for larger businesses planning significant growth and potential public investment";
  }

  // Generate tax obligations
  const taxObligations = [
    "Corporation Tax (19-25% on profits)",
    "PAYE (if employing UK staff)",
    "National Insurance contributions"
  ];

  if (hasOnlineStore || revenue !== "0-50k") {
    taxObligations.push("VAT Registration (mandatory if UK turnover exceeds £90,000)");
  }

  if (sellsGoods) {
    taxObligations.push("Customs Duty (varies by HS code and origin)");
    taxObligations.push("Import VAT (20% standard rate, reclaimable if VAT registered)");
  }

  if (industry === "Manufacturing" || industry === "Technology") {
    taxObligations.push("Import/Export duties (based on trade agreements)");
  }

  // Generate compliance calendar
  const complianceCalendar: ComplianceEvent[] = [
    {
      title: "UK EORI Number Application",
      description: "Apply for EORI number before any import/export activities",
      deadline: "Before first shipment",
      frequency: 'once',
      priority: 'high',
      category: 'customs'
    },
    {
      title: "Company Registration",
      description: "Register company with Companies House",
      deadline: "Before trading begins",
      frequency: 'once',
      priority: 'high',
      category: 'registration'
    },
    {
      title: "Tax Registration (HMRC)",
      description: "Register for Corporation Tax, PAYE, and VAT (if applicable)",
      deadline: "Within 3 months of incorporation",
      frequency: 'once',
      priority: 'high',
      category: 'tax'
    },
    {
      title: "Confirmation Statement",
      description: "Submit annual confirmation statement to Companies House",
      deadline: "Annually",
      frequency: 'annually',
      priority: 'medium',
      category: 'filing'
    },
    {
      title: "Corporation Tax Return",
      description: "Submit CT600 return to HMRC",
      deadline: "12 months after accounting period end",
      frequency: 'annually',
      priority: 'high',
      category: 'tax'
    },
    {
      title: "Annual Accounts Filing",
      description: "File annual accounts with Companies House",
      deadline: "9 months after financial year end",
      frequency: 'annually',
      priority: 'high',
      category: 'filing'
    }
  ];

  if (hasOnlineStore || revenue !== "0-50k") {
    complianceCalendar.push({
      title: "VAT Return",
      description: "Submit quarterly VAT return to HMRC (if VAT registered)",
      deadline: "Quarterly (1 month + 7 days after quarter end)",
      frequency: 'quarterly',
      priority: 'high',
      category: 'tax'
    });
  }

  if (sellsGoods) {
    complianceCalendar.push({
      title: "Customs Declarations",
      description: "Submit customs declarations via CDS for each shipment",
      deadline: "Per shipment",
      frequency: 'monthly',
      priority: 'high',
      category: 'customs'
    });
    complianceCalendar.push({
      title: "Intrastat Report",
      description: "Submit Intrastat declaration for EU trade (if applicable)",
      deadline: "Monthly (21st of following month)",
      frequency: 'monthly',
      priority: 'medium',
      category: 'trade'
    });
  }

  // Required registrations based on business type
  const requiredRegistrations = [
    "Companies House registration (or UK branch registration)",
    "HMRC tax registration (Corporation Tax)",
    "ICO Data Protection registration (if processing personal data)"
  ];

  if (sellsGoods) {
    requiredRegistrations.unshift("UK EORI Number (essential for customs)");
    requiredRegistrations.push("UK Responsible Person (for regulated products)");
    requiredRegistrations.push("Trade Tariff Classification (HS codes for products)");
  }

  if (industry === "Food & Beverage") {
    requiredRegistrations.push("Food Standards Agency (FSA) registration");
    requiredRegistrations.push("Food Business Registration with Local Authority");
  }

  if (industry === "Healthcare" || industry === "Healthcare & Medical") {
    requiredRegistrations.push("MHRA registration (medical devices/pharmaceuticals)");
    requiredRegistrations.push("CQC registration (if providing care services)");
  }

  if (industry === "Financial Services") {
    requiredRegistrations.push("FCA Authorization");
    requiredRegistrations.push("AML Registration with HMRC");
  }

  if (industry === "Manufacturing" || industry === "Technology") {
    requiredRegistrations.push("UKCA Marking certification");
    requiredRegistrations.push("UK REACH registration (if applicable)");
  }

  // Estimated setup cost
  let estimatedSetupCost = "£2,000 - £5,000";
  if (industry === "Healthcare" || industry === "Healthcare & Medical" || industry === "Financial Services") {
    estimatedSetupCost = "£10,000 - £30,000";
  } else if (recommendedCompanyType === "Public Limited Company (PLC)") {
    estimatedSetupCost = "£15,000 - £50,000";
  } else if (sellsGoods && (businessType === 'manufacturer' || businessType === 'both')) {
    estimatedSetupCost = "£3,000 - £8,000";
  }

  // Get customs requirements and product standards
  const customsRequirements = sellsGoods ? getCustomsRequirements(businessType) : getCustomsRequirements('services');
  const productStandards = getProductStandards(industry);

  return {
    recommendedCompanyType,
    taxObligations,
    complianceCalendar,
    requiredRegistrations,
    estimatedSetupCost,
    reasoning,
    customsRequirements,
    productStandards
  };
};
