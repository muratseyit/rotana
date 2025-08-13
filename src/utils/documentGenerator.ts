export interface DocumentTemplate {
  id: string;
  name: string;
  type: 'legal' | 'tax' | 'business' | 'compliance';
  description: string;
  requiredFields: string[];
}

export const documentTemplates: DocumentTemplate[] = [
  {
    id: 'nda',
    name: 'Non-Disclosure Agreement (NDA)',
    type: 'legal',
    description: 'Standard NDA for protecting confidential business information',
    requiredFields: ['companyName', 'partnerName', 'effectiveDate']
  },
  {
    id: 'ip-agreement',
    name: 'Intellectual Property Agreement',
    type: 'legal',
    description: 'Agreement for IP licensing and protection',
    requiredFields: ['companyName', 'ipDescription', 'licenseTerm']
  },
  {
    id: 'invoice-template',
    name: 'Business Invoice Template',
    type: 'business',
    description: 'Professional invoice template with tax calculations',
    requiredFields: ['companyName', 'taxNumber', 'customerDetails']
  },
  {
    id: 'tax-registration',
    name: 'Tax Registration Form',
    type: 'tax',
    description: 'Tax registration application form',
    requiredFields: ['companyName', 'businessAddress', 'expectedTurnover']
  },
  {
    id: 'company-formation',
    name: 'Company Formation Documents',
    type: 'compliance',
    description: 'Documents required for company registration',
    requiredFields: ['companyName', 'directors', 'shareCapital']
  },
  {
    id: 'service-agreement',
    name: 'Service Agreement',
    type: 'business',
    description: 'Standard service agreement template for clients',
    requiredFields: ['companyName', 'serviceDescription', 'paymentTerms']
  }
];

export function generateDocument(templateId: string, data: Record<string, any>): string {
  const template = documentTemplates.find(t => t.id === templateId);
  if (!template) {
    throw new Error(`Template ${templateId} not found`);
  }

  switch (templateId) {
    case 'nda':
      return generateNDA(data);
    case 'ip-agreement':
      return generateIPAgreement(data);
    case 'invoice-template':
      return generateInvoice(data);
    case 'tax-registration':
      return generateTaxRegistration(data);
    case 'company-formation':
      return generateCompanyFormation(data);
    case 'service-agreement':
      return generateServiceAgreement(data);
    default:
      throw new Error(`Generator for template ${templateId} not implemented`);
  }
}

function generateNDA(data: Record<string, any>): string {
  const { companyName, partnerName, effectiveDate } = data;
  
  return `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into on ${effectiveDate} by and between:

Company: ${companyName}
Partner: ${partnerName}

WHEREAS, the parties wish to explore a business relationship and may disclose confidential information;

NOW, THEREFORE, the parties agree as follows:

1. CONFIDENTIAL INFORMATION
"Confidential Information" means any and all non-public, proprietary or confidential information disclosed by either party.

2. OBLIGATIONS
The receiving party agrees to:
- Keep all Confidential Information strictly confidential
- Use Confidential Information solely for evaluation purposes
- Not disclose Confidential Information to third parties

3. TERM
This Agreement shall remain in effect for a period of three (3) years from the effective date.

4. GOVERNING LAW
This Agreement shall be governed by applicable business laws.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

${companyName}                    ${partnerName}

_________________                 _________________
Signature                        Signature

_________________                 _________________
Print Name                       Print Name

_________________                 _________________
Date                             Date`;
}

function generateIPAgreement(data: Record<string, any>): string {
  const { companyName, ipDescription, licenseTerm } = data;
  
  return `INTELLECTUAL PROPERTY AGREEMENT

This Intellectual Property Agreement ("Agreement") is entered into by ${companyName}.

IP DESCRIPTION: ${ipDescription}

LICENSE TERM: ${licenseTerm}

1. OWNERSHIP
${companyName} retains all rights, title, and interest in the intellectual property.

2. LICENSE GRANT
Subject to the terms of this Agreement, a license is granted for the specified term.

3. RESTRICTIONS
- No modification without written consent
- No reverse engineering
- No distribution to third parties

4. TERMINATION
This Agreement may be terminated with 30 days written notice.

${companyName}

_________________
Signature

_________________
Date`;
}

function generateInvoice(data: Record<string, any>): string {
  const { companyName, taxNumber, customerDetails, items = [], total = 0 } = data;
  
  return `INVOICE

From: ${companyName}
Tax Number: ${taxNumber}

To: ${customerDetails}

Date: ${new Date().toLocaleDateString()}
Invoice #: INV-${Date.now()}

ITEMS:
${items.map((item: any) => `${item.description} - $${item.amount}`).join('\n')}

TOTAL: $${total}

Payment Terms: Net 30 days

Thank you for your business!

${companyName}`;
}

function generateTaxRegistration(data: Record<string, any>): string {
  const { companyName, businessAddress, expectedTurnover } = data;
  
  return `TAX REGISTRATION APPLICATION

Company Name: ${companyName}
Business Address: ${businessAddress}
Expected Annual Turnover: $${expectedTurnover}

BUSINESS INFORMATION:
- Legal Structure: To be determined
- Business Activities: As per company description
- Registration Date: ${new Date().toLocaleDateString()}

DECLARATION:
I declare that the information provided is true and accurate.

${companyName}

_________________
Signature

_________________
Date`;
}

function generateCompanyFormation(data: Record<string, any>): string {
  const { companyName, directors, shareCapital } = data;
  
  return `COMPANY FORMATION DOCUMENTS

COMPANY NAME: ${companyName}

DIRECTORS:
${Array.isArray(directors) ? directors.join('\n') : directors}

SHARE CAPITAL: $${shareCapital}

MEMORANDUM OF ASSOCIATION:
1. The name of the company is ${companyName}
2. The registered office is situated in the specified jurisdiction
3. The objects of the company are unrestricted

ARTICLES OF ASSOCIATION:
Standard articles of association apply unless modified.

Date: ${new Date().toLocaleDateString()}

This document serves as the foundation for company registration.`;
}

function generateServiceAgreement(data: Record<string, any>): string {
  const { companyName, serviceDescription, paymentTerms } = data;
  
  return `SERVICE AGREEMENT

SERVICE PROVIDER: ${companyName}

SERVICES: ${serviceDescription}

PAYMENT TERMS: ${paymentTerms}

1. SCOPE OF SERVICES
${companyName} agrees to provide the services described above.

2. PAYMENT
Client agrees to pay according to the specified payment terms.

3. TERM
This agreement shall commence upon execution and continue until completion of services.

4. TERMINATION
Either party may terminate with written notice.

5. GOVERNING LAW
This Agreement shall be governed by applicable law.

${companyName}

_________________
Signature

_________________
Date`;
}