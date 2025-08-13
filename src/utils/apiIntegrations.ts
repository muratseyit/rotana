export interface CompanyHouseData {
  companyNumber: string;
  companyName: string;
  companyStatus: string;
  incorporationDate: string;
  companyType: string;
  registeredOfficeAddress: any;
}

export interface TaxStatus {
  taxNumber?: string;
  corporationTaxUTR?: string;
  payeReference?: string;
  registrationStatus: 'active' | 'pending' | 'not_registered';
}

// Mock API functions - in production these would call actual APIs
export const checkCompanyHouseAvailability = async (companyName: string): Promise<boolean> => {
  // Mock delay to simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock logic - in reality this would call Companies House API
  const unavailableNames = ['Test Ltd', 'Example Limited', 'Demo Company'];
  return !unavailableNames.includes(companyName);
};

export const registerCompanyWithCompaniesHouse = async (companyData: any): Promise<CompanyHouseData> => {
  // Mock delay to simulate API call
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Mock response - in reality this would call Companies House API
  return {
    companyNumber: `${Math.floor(Math.random() * 10000000).toString().padStart(8, '0')}`,
    companyName: companyData.companyName,
    companyStatus: 'Active',
    incorporationDate: new Date().toISOString().split('T')[0],
    companyType: 'Private limited company',
    registeredOfficeAddress: companyData.registeredAddress
  };
};

export const checkTaxRegistrationStatus = async (companyNumber: string): Promise<TaxStatus> => {
  // Mock delay to simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Mock response - in reality this would call tax authority API
  return {
    registrationStatus: Math.random() > 0.5 ? 'active' : 'not_registered',
    taxNumber: Math.random() > 0.5 ? `TAX${Math.floor(Math.random() * 100000)}` : undefined,
    corporationTaxUTR: Math.random() > 0.5 ? `CT${Math.floor(Math.random() * 100000)}` : undefined,
  };
};

export const getComplianceUpdates = async (companyNumber: string): Promise<any[]> => {
  // Mock delay to simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock compliance updates
  return [
    {
      id: '1',
      title: 'Annual Return Due',
      description: 'Your annual return is due in 30 days',
      priority: 'high',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'filing'
    },
    {
      id: '2',
      title: 'Tax Registration Reminder',
      description: 'Complete your tax registration within 3 months of incorporation',
      priority: 'medium',
      dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'tax'
    }
  ];
};

export const submitComplianceForm = async (formType: string, formData: any): Promise<{ success: boolean; referenceNumber?: string }> => {
  // Mock delay to simulate API call
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Mock response
  return {
    success: Math.random() > 0.1, // 90% success rate
    referenceNumber: `REF${Math.floor(Math.random() * 1000000)}`
  };
};

export const getBusinessRegistrationRequirements = async (industry: string, businessType: string): Promise<string[]> => {
  // Mock delay to simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));

  const baseRequirements = [
    'Company registration',
    'Tax registration',
    'Business license'
  ];

  const industryRequirements: Record<string, string[]> = {
    'Healthcare': ['Medical device approval', 'Healthcare license'],
    'Food & Beverage': ['Food safety registration', 'Hygiene certification'],
    'Financial Services': ['Financial services license', 'Regulatory approval'],
    'Technology': ['Data protection registration', 'Software licensing'],
    'Manufacturing': ['Safety compliance certificate', 'Environmental permit']
  };

  return [...baseRequirements, ...(industryRequirements[industry] || [])];
};