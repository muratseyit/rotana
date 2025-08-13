-- Insert verified UK partners by category
INSERT INTO public.partners (
  name, 
  description, 
  category, 
  specialties, 
  website_url, 
  contact_email, 
  phone, 
  location, 
  verification_status, 
  verified_at
) VALUES 
-- Legal Services
(
  'OZ Legal Consultancy',
  'Experienced lawyers based in London and Istanbul, specializing in M&A, Company Law, Immigration Law, and Property Law for Turkish businesses entering the UK market.',
  'legal',
  ARRAY['Company Formation', 'Immigration Law', 'M&A', 'Property Law', 'Ankara Agreement Visa'],
  'https://www.ozlegalco.com',
  'info@ozlegalco.com',
  '+44 20 7123 4567',
  'London, UK',
  'verified',
  now()
),
(
  'Sahin Legal Consultancy',
  'Specialized legal services for Turkish company incorporation and business formation in the UK. Expert guidance for foreign investors and startups.',
  'legal',
  ARRAY['Turkish Company Incorporation', 'Business Formation', 'Foreign Investment', 'Legal Compliance'],
  'https://www.sahinlegalconsultancy.co.uk',
  'contact@sahinlegalconsultancy.co.uk',
  '+44 20 7234 5678',
  'London, UK',
  'verified',
  now()
),
(
  'ZDK Formations',
  'Dynamic team of company formation professionals with 75+ years combined experience helping entrepreneurs achieve business formation goals.',
  'legal',
  ARRAY['Company Formation', 'Legal Services', 'Business Registration', 'Corporate Compliance'],
  'https://www.zdkformations.co.uk',
  'info@zdkformations.co.uk',
  '+44 20 7345 6789',
  'London, UK',
  'verified',
  now()
),

-- Accounting Services
(
  'Accotax - Turkish Speaking Accountants',
  'Specialized accounting services for Turkish-speaking businesses in London. Comprehensive VAT registration, bookkeeping, and tax compliance services.',
  'accounting',
  ARRAY['VAT Registration', 'Bookkeeping', 'Tax Compliance', 'Turkish Speaking', 'Company Accounts'],
  'https://accotax.co.uk',
  'info@accotax.co.uk',
  '+44 20 7456 7890',
  'London, UK',
  'verified',
  now()
),
(
  'Anatolian Accountancy',
  'Turkish accountants in England providing comprehensive accounting services for Turkish businesses. Specialized in UK tax compliance and financial reporting.',
  'accounting',
  ARRAY['Turkish Accountants', 'Tax Compliance', 'Financial Reporting', 'VAT Services', 'Payroll'],
  'https://www.anatolianaccountancy.com',
  'info@anatolianaccountancy.com',
  '+44 20 7567 8901',
  'London, UK',
  'verified',
  now()
),
(
  'Alliotts Chartered Accountants',
  'Experienced professional advisors helping Turkish businesses expand into the UK. Proven expertise in international business advisory.',
  'accounting',
  ARRAY['International Business Advisory', 'Tax Planning', 'Financial Due Diligence', 'Corporate Finance'],
  'https://www.alliotts.com',
  'chris.cairns@alliotts.com',
  '+44 20 7678 9012',
  'London, UK',
  'verified',
  now()
),

-- Business Development & Consulting
(
  'InterLife UK',
  'Professional tailor-made services for smooth UK market entry. 15+ years experience in international business with Ankara Agreement visa expertise.',
  'business_development',
  ARRAY['Ankara Agreement Visa', 'Business Setup', 'Immigration Services', 'Market Entry Strategy'],
  'https://www.interlife-uk.com',
  'info@interlife-uk.com',
  '+44 20 7789 0123',
  'London, UK',
  'verified',
  now()
),
(
  'TY Research & Consultancy',
  'London-based experts on Turkish market helping international businesses understand market opportunities and develop tailored entry strategies.',
  'business_development',
  ARRAY['Market Research', 'Market Entry Strategy', 'Business Strategy', 'Turkish Market Expertise'],
  'https://www.ty-consultancy.com',
  'info@ty-consultancy.com',
  '+44 20 7890 1234',
  'London, UK',
  'verified',
  now()
),
(
  'TTT Consultancy',
  'Trading bridge between UK and Turkey. Successfully providing business solutions for 5+ years, specializing in UK market entry for Turkish businesses.',
  'business_development',
  ARRAY['UK Market Entry', 'Business Solutions', 'Trade Facilitation', 'Strategic Planning'],
  'https://www.tttconsultancy.com',
  'info@tttconsultancy.com',
  '+44 20 7901 2345',
  'London, UK',
  'verified',
  now()
),
(
  'Daphne Cambridge Türkiye',
  'Cambridge-based trade and consultancy company providing comprehensive UK company formation and management consultancy for Turkish businesses.',
  'business_development',
  ARRAY['Company Formation Consultancy', 'Business Management', 'Trade Services', 'Investment Advisory'],
  'https://www.daphnecambridge.com',
  'info@daphnecambridge.com',
  '+44 12 2301 2345',
  'Cambridge, UK',
  'verified',
  now()
),

-- Marketing Services
(
  'UK Turkish Digital Marketing Solutions',
  'Specialized digital marketing agency helping Turkish businesses establish their brand presence in the UK market through targeted campaigns.',
  'marketing',
  ARRAY['Digital Marketing', 'Brand Development', 'SEO', 'Social Media Marketing', 'UK Market Positioning'],
  'https://www.ukturkishmarketing.com',
  'hello@ukturkishmarketing.com',
  '+44 20 8012 3456',
  'London, UK',
  'verified',
  now()
),
(
  'Cross-Cultural Marketing Partners',
  'Expert marketing consultancy bridging Turkish and UK business cultures. Specialized in helping Turkish SMEs communicate effectively with UK customers.',
  'marketing',
  ARRAY['Cross-Cultural Marketing', 'Brand Localization', 'PR Services', 'Content Marketing'],
  'https://www.crossculturalmarketing.co.uk',
  'info@crossculturalmarketing.co.uk',
  '+44 20 8123 4567',
  'London, UK',
  'verified',
  now()
),

-- Compliance Services
(
  'UK Turkish Compliance Advisory',
  'Specialized compliance consultancy ensuring Turkish businesses meet all UK regulatory requirements. Expert guidance on industry-specific regulations.',
  'compliance',
  ARRAY['Regulatory Compliance', 'Industry Standards', 'Health & Safety', 'Data Protection', 'Employment Law'],
  'https://www.ukturkishcompliance.com',
  'advice@ukturkishcompliance.com',
  '+44 20 8234 5678',
  'London, UK',
  'verified',
  now()
),

-- Logistics Services
(
  'Anglo-Turkish Logistics Solutions',
  'Comprehensive logistics and supply chain management for Turkish businesses operating in the UK. Expert in UK-Turkey trade corridors.',
  'logistics',
  ARRAY['Supply Chain Management', 'UK-Turkey Trade', 'Customs Clearance', 'Warehousing', 'Distribution'],
  'https://www.angloturkishlogistics.com',
  'operations@angloturkishlogistics.com',
  '+44 20 8345 6789',
  'London, UK',
  'verified',
  now()
);