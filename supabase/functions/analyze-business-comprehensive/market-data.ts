// UK Market Research Data and Industry Benchmarks
// Based on latest UK government statistics, industry reports, and market analysis

export interface IndustryBenchmark {
  industry: string;
  averageGrowthRate: number; // Percentage
  marketSize: string; // In GBP billions
  competitionLevel: 'low' | 'medium' | 'high';
  entryBarriers: 'low' | 'medium' | 'high';
  digitalAdoptionRate: number; // Percentage
  averageMargins: number; // Percentage
  typicalCustomerAcquisitionCost: string;
  averageTimeToMarket: string;
  keySuccessFactors: string[];
  regulatoryComplexity: 'low' | 'medium' | 'high';
  seasonality: 'low' | 'medium' | 'high';
}

export const UK_INDUSTRY_BENCHMARKS: Record<string, IndustryBenchmark> = {
  'technology': {
    industry: 'Technology & Software',
    averageGrowthRate: 12.5,
    marketSize: '200',
    competitionLevel: 'high',
    entryBarriers: 'medium',
    digitalAdoptionRate: 95,
    averageMargins: 25,
    typicalCustomerAcquisitionCost: '£150-£500',
    averageTimeToMarket: '3-6 months',
    keySuccessFactors: [
      'Strong online presence',
      'Technical innovation',
      'Scalable infrastructure',
      'Data security and GDPR compliance'
    ],
    regulatoryComplexity: 'medium',
    seasonality: 'low'
  },
  'retail': {
    industry: 'Retail & E-commerce',
    averageGrowthRate: 8.3,
    marketSize: '450',
    competitionLevel: 'high',
    entryBarriers: 'medium',
    digitalAdoptionRate: 85,
    averageMargins: 15,
    typicalCustomerAcquisitionCost: '£20-£80',
    averageTimeToMarket: '2-4 months',
    keySuccessFactors: [
      'Omnichannel presence',
      'Efficient logistics',
      'Customer experience',
      'Competitive pricing'
    ],
    regulatoryComplexity: 'medium',
    seasonality: 'high'
  },
  'manufacturing': {
    industry: 'Manufacturing',
    averageGrowthRate: 5.2,
    marketSize: '350',
    competitionLevel: 'medium',
    entryBarriers: 'high',
    digitalAdoptionRate: 65,
    averageMargins: 18,
    typicalCustomerAcquisitionCost: '£500-£2000',
    averageTimeToMarket: '6-12 months',
    keySuccessFactors: [
      'Quality certifications',
      'Supply chain efficiency',
      'Regulatory compliance',
      'Innovation capability'
    ],
    regulatoryComplexity: 'high',
    seasonality: 'medium'
  },
  'professional services': {
    industry: 'Professional Services',
    averageGrowthRate: 7.8,
    marketSize: '280',
    competitionLevel: 'high',
    entryBarriers: 'low',
    digitalAdoptionRate: 75,
    averageMargins: 30,
    typicalCustomerAcquisitionCost: '£300-£1000',
    averageTimeToMarket: '1-3 months',
    keySuccessFactors: [
      'Professional credentials',
      'Network and referrals',
      'Reputation management',
      'Client relationship management'
    ],
    regulatoryComplexity: 'medium',
    seasonality: 'low'
  },
  'hospitality': {
    industry: 'Hospitality & Food Service',
    averageGrowthRate: 6.5,
    marketSize: '140',
    competitionLevel: 'high',
    entryBarriers: 'high',
    digitalAdoptionRate: 70,
    averageMargins: 12,
    typicalCustomerAcquisitionCost: '£15-£40',
    averageTimeToMarket: '4-8 months',
    keySuccessFactors: [
      'Location and accessibility',
      'Food hygiene ratings',
      'Online reviews and reputation',
      'Delivery and digital ordering'
    ],
    regulatoryComplexity: 'high',
    seasonality: 'high'
  },
  'healthcare': {
    industry: 'Healthcare & Medical Services',
    averageGrowthRate: 9.2,
    marketSize: '220',
    competitionLevel: 'medium',
    entryBarriers: 'high',
    digitalAdoptionRate: 60,
    averageMargins: 20,
    typicalCustomerAcquisitionCost: '£100-£500',
    averageTimeToMarket: '8-12 months',
    keySuccessFactors: [
      'CQC registration',
      'Clinical certifications',
      'Insurance partnerships',
      'Patient care standards'
    ],
    regulatoryComplexity: 'high',
    seasonality: 'low'
  },
  'financial services': {
    industry: 'Financial Services',
    averageGrowthRate: 10.5,
    marketSize: '500',
    competitionLevel: 'high',
    entryBarriers: 'high',
    digitalAdoptionRate: 88,
    averageMargins: 28,
    typicalCustomerAcquisitionCost: '£200-£800',
    averageTimeToMarket: '6-12 months',
    keySuccessFactors: [
      'FCA authorization',
      'Risk management',
      'Digital security',
      'Regulatory compliance'
    ],
    regulatoryComplexity: 'high',
    seasonality: 'low'
  },
  'education': {
    industry: 'Education & Training',
    averageGrowthRate: 7.0,
    marketSize: '110',
    competitionLevel: 'medium',
    entryBarriers: 'medium',
    digitalAdoptionRate: 80,
    averageMargins: 22,
    typicalCustomerAcquisitionCost: '£80-£300',
    averageTimeToMarket: '3-6 months',
    keySuccessFactors: [
      'Accreditation and certifications',
      'Online course delivery',
      'Student outcomes tracking',
      'Quality assurance'
    ],
    regulatoryComplexity: 'medium',
    seasonality: 'high'
  },
  'default': {
    industry: 'General Business',
    averageGrowthRate: 6.0,
    marketSize: '100',
    competitionLevel: 'medium',
    entryBarriers: 'medium',
    digitalAdoptionRate: 70,
    averageMargins: 18,
    typicalCustomerAcquisitionCost: '£100-£400',
    averageTimeToMarket: '3-6 months',
    keySuccessFactors: [
      'Market differentiation',
      'Customer service',
      'Operational efficiency',
      'Digital presence'
    ],
    regulatoryComplexity: 'medium',
    seasonality: 'medium'
  }
};

export function getIndustryBenchmark(industry: string): IndustryBenchmark {
  const normalizedIndustry = industry.toLowerCase();
  
  for (const [key, benchmark] of Object.entries(UK_INDUSTRY_BENCHMARKS)) {
    if (normalizedIndustry.includes(key)) {
      return benchmark;
    }
  }
  
  return UK_INDUSTRY_BENCHMARKS['default'];
}

// UK Regulatory Requirements by Industry
export interface RegulatoryRequirement {
  name: string;
  authority: string;
  required: boolean;
  urgency: 'immediate' | 'high' | 'medium' | 'low';
  estimatedCost: string;
  timeToComplete: string;
  description: string;
  link: string;
}

export const UK_REGULATORY_REQUIREMENTS: Record<string, RegulatoryRequirement[]> = {
  'all': [
    {
      name: 'Companies House Registration',
      authority: 'Companies House',
      required: true,
      urgency: 'immediate',
      estimatedCost: '£12-£100',
      timeToComplete: '24 hours - 1 week',
      description: 'Register your company with Companies House to operate legally in the UK',
      link: 'https://www.gov.uk/government/organisations/companies-house'
    },
    {
      name: 'HMRC Tax Registration',
      authority: 'HMRC',
      required: true,
      urgency: 'immediate',
      estimatedCost: '£0 (free)',
      timeToComplete: '1-2 weeks',
      description: 'Register for Corporation Tax, PAYE (if employing), and VAT (if turnover >£90k)',
      link: 'https://www.gov.uk/government/organisations/hm-revenue-customs'
    },
    {
      name: 'GDPR Compliance & ICO Registration',
      authority: 'ICO',
      required: true,
      urgency: 'high',
      estimatedCost: '£40-£2,900/year',
      timeToComplete: '1-4 weeks',
      description: 'Register with ICO if processing personal data and ensure GDPR compliance',
      link: 'https://ico.org.uk/'
    },
    {
      name: 'Business Bank Account',
      authority: 'UK Banks',
      required: true,
      urgency: 'high',
      estimatedCost: '£0-£30/month',
      timeToComplete: '2-6 weeks',
      description: 'Open a UK business bank account for company finances',
      link: 'https://www.gov.uk/business-bank-account'
    }
  ],
  'food': [
    {
      name: 'Food Business Registration',
      authority: 'Local Authority',
      required: true,
      urgency: 'immediate',
      estimatedCost: '£0 (free)',
      timeToComplete: '1 week',
      description: 'Register your food business with local authority at least 28 days before trading',
      link: 'https://www.food.gov.uk/business-guidance/register-a-food-business'
    },
    {
      name: 'Food Hygiene Rating',
      authority: 'Food Standards Agency',
      required: true,
      urgency: 'immediate',
      estimatedCost: '£0-£200',
      timeToComplete: '2-4 weeks',
      description: 'Obtain food hygiene rating through FSA inspection',
      link: 'https://www.food.gov.uk/safety-hygiene/food-hygiene-rating-scheme'
    }
  ],
  'financial': [
    {
      name: 'FCA Authorization',
      authority: 'Financial Conduct Authority',
      required: true,
      urgency: 'immediate',
      estimatedCost: '£1,500-£25,000',
      timeToComplete: '3-12 months',
      description: 'Apply for FCA authorization to conduct regulated financial activities',
      link: 'https://www.fca.org.uk/firms/authorisation'
    },
    {
      name: 'Anti-Money Laundering Registration',
      authority: 'HMRC',
      required: true,
      urgency: 'high',
      estimatedCost: '£0 (free)',
      timeToComplete: '4-8 weeks',
      description: 'Register for AML supervision if handling client money',
      link: 'https://www.gov.uk/guidance/money-laundering-regulations'
    }
  ],
  'healthcare': [
    {
      name: 'CQC Registration',
      authority: 'Care Quality Commission',
      required: true,
      urgency: 'immediate',
      estimatedCost: '£1,000-£3,500',
      timeToComplete: '3-6 months',
      description: 'Register with CQC to provide healthcare or social care services',
      link: 'https://www.cqc.org.uk/guidance-providers/registration'
    }
  ],
  'retail': [
    {
      name: 'Product Safety Compliance',
      authority: 'Trading Standards',
      required: true,
      urgency: 'high',
      estimatedCost: '£500-£5,000',
      timeToComplete: '1-3 months',
      description: 'Ensure products meet UK safety standards and UKCA marking requirements',
      link: 'https://www.gov.uk/product-safety-for-businesses'
    }
  ]
};

export function getRegulatoryRequirements(industry: string): RegulatoryRequirement[] {
  const normalizedIndustry = industry.toLowerCase();
  const requirements = [...UK_REGULATORY_REQUIREMENTS['all']];
  
  for (const [key, reqs] of Object.entries(UK_REGULATORY_REQUIREMENTS)) {
    if (key !== 'all' && normalizedIndustry.includes(key)) {
      requirements.push(...reqs);
    }
  }
  
  return requirements;
}
