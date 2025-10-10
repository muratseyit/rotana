import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'tr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Header
    'nav.features': 'Features',
    'nav.pricing': 'Pricing',
    'nav.support': 'Support',
    'nav.login': 'Sign In',
    'nav.getStarted': 'Get Started',
    'nav.partners': 'Partners',
    'nav.admin': 'Admin',
    'nav.dashboard': 'Go to Dashboard',

    // Hero Section
    'hero.badge': 'AI-Powered Business Intelligence',
    'hero.title': 'Accelerate Market Entry with Smart Analytics',
    'hero.description': 'Get comprehensive analysis of your business with AI-powered insights. Understand your market position, identify opportunities, and make data-driven decisions.',
    'hero.startJourney': 'Start Your Analysis',
    'hero.watchDemo': 'Watch Demo',

    // Features Section
    'features.title': 'Powerful Features for Business Growth',
    'features.subtitle': 'Everything you need to analyze, understand, and grow your business',
    'features.aiScore': 'AI-Powered Analysis',
    'features.aiScoreDesc': 'Advanced artificial intelligence analyzes your business data to provide actionable insights',
    'features.docGenerator': 'Comprehensive Reports',
    'features.docGeneratorDesc': 'Get detailed reports covering market analysis, competitive landscape, and growth opportunities',
    'features.partnerMatching': 'Partner Matching',
    'features.partnerMatchingDesc': 'Connect with verified business partners and service providers tailored to your needs',
    'features.smartRoadmap': 'Smart Roadmap',
    'features.smartRoadmapDesc': 'Get a personalized roadmap with actionable steps to achieve your business goals',

    // How It Works Section
    'howItWorks.title': 'How It Works',
    'howItWorks.subtitle': 'Get started with your business analysis in three simple steps',
    'howItWorks.step1': 'Share Your Business Info',
    'howItWorks.step1Desc': 'Tell us about your business, goals, and current challenges through our simple form',
    'howItWorks.step2': 'Get AI Analysis',
    'howItWorks.step2Desc': 'Our AI analyzes your business data and generates comprehensive insights and recommendations',
    'howItWorks.step3': 'Take Action',
    'howItWorks.step3Desc': 'Follow your personalized roadmap and connect with recommended partners to grow your business',

    // CTA Section
    'cta.title': 'Ready to Transform Your Business?',
    'cta.description': 'Join thousands of businesses that have already discovered their growth potential with our AI-powered platform',
    'cta.startAnalysis': 'Start Free Analysis',
    'cta.scheduleConsult': 'Schedule Consultation',
    'cta.leadFormTitle': 'Get Your Comprehensive Market Analysis',
    'cta.leadFormDesc': 'Discover your UK market potential with AI-powered insights and verified partner recommendations',

    // Footer
    'footer.description': 'Empowering businesses with AI-driven insights and strategic guidance for sustainable growth',
    'footer.platform': 'Platform',
    'footer.support': 'Support',
    'footer.legal': 'Legal',
    'footer.features': 'Features',
    'footer.pricing': 'Pricing',
    'footer.api': 'API',
    'footer.helpCenter': 'Help Center',
    'footer.contact': 'Contact',
    'footer.community': 'Community',
    'footer.privacy': 'Privacy',
    'footer.terms': 'Terms',
    'footer.cookies': 'Cookies',
    'footer.copyright': '© 2024 Business Bridge. All rights reserved.',

    // Guest Analysis Form
    'analysis.form.title': 'Get Your Free AI Business Analysis',
    'analysis.form.subtitle': 'Receive comprehensive insights and recommendations for your business',
    'analysis.form.email': 'Email Address',
    'analysis.form.companyName': 'Company Name',
    'analysis.form.businessDesc': 'Business Description',
    'analysis.form.businessDescPlaceholder': 'Describe your business, products/services, and target market...',
    'analysis.form.industry': 'Industry',
    'analysis.form.selectIndustry': 'Select industry',
    'analysis.form.companySize': 'Company Size',
    'analysis.form.selectSize': 'Select size',
    'analysis.form.websiteUrl': 'Website URL (Optional)',
    'analysis.form.whatYouGet': "What you'll get:",
    'analysis.form.benefit1': 'Comprehensive AI business analysis',
    'analysis.form.benefit2': 'UK market readiness score',
    'analysis.form.benefit3': 'Business recommendations and insights',
    'analysis.form.benefit4': 'Instant results',
    'analysis.form.submit': 'Get Free Analysis',
    'analysis.form.processing': 'Processing Analysis...',
    'analysis.form.required': 'Required Fields Missing',
    'analysis.form.requiredDesc': 'Please fill in all required fields.',

    // Guest Analysis Page
    'analysis.page.backHome': 'Back to Home',
    'analysis.page.title': 'Get Your AI Business Analysis',
    'analysis.page.subtitle': 'Get comprehensive insights about your UK market readiness and connect with our verified partner directory - completely free.',
    'analysis.page.aiTitle': 'AI-Powered Analysis',
    'analysis.page.aiDesc': 'Advanced algorithms analyze your business for UK market readiness',
    'analysis.page.reportTitle': 'Comprehensive Report',
    'analysis.page.reportDesc': 'Detailed insights, recommendations, and growth opportunities',
    'analysis.page.partnerTitle': 'Partner Access',
    'analysis.page.partnerDesc': 'Connect with verified UK business partners and service providers',

    // Guest Results Page
    'results.complete': 'Analysis Complete!',
    'results.ready': 'Your AI business analysis results are ready.',
    'results.score': 'UK Market Readiness Score',
    'results.limited': 'Limited Analysis',
    'results.upgrade': 'Upgrade for Complete Analysis',
    'results.keyFindings': 'Key Findings',
    'results.recommendations': 'Recommendations',
    'results.riskFactors': 'Risk Factors',
    'results.unlockFull': 'Unlock Your Full Business Potential',
    'results.nextStep': 'Ready to Take the Next Step?',
    'results.createAccount': 'Create an account to save your results, access our partner directory, and get personalized recommendations.',
    'results.upgradePremium': 'Upgrade to Premium',
    'results.downloadReport': 'Download Report',
    'results.downloadSummary': 'Download Summary',
    'results.generating': 'Generating your business analysis...',
    'results.notFound': 'Analysis Not Found',
    'results.notFoundDesc': "We couldn't find your analysis results. Please contact support.",
    'results.returnHome': 'Return Home',

    // Lead Capture Form
    'leadForm.defaultTitle': 'Get Your Free Business Analysis',
    'leadForm.defaultTitleAlt': 'Start Your UK Market Journey',
    'leadForm.defaultDesc': 'Discover your UK market potential with our AI-powered analysis. Get personalized insights and partner recommendations.',
    'leadForm.defaultDescAlt': 'Join hundreds of Turkish businesses successfully expanding to the UK market.',
    'leadForm.incentive': 'Free AI Analysis + Partner Matching Report (Worth £299)',
    'leadForm.fullName': 'Full Name',
    'leadForm.email': 'Email Address',
    'leadForm.phone': 'Phone Number',
    'leadForm.company': 'Company Name',
    'leadForm.industry': 'Industry',
    'leadForm.selectIndustry': 'Select your industry',
    'leadForm.interests': 'Areas of Interest',
    'leadForm.goals': 'Tell us about your goals',
    'leadForm.goalsPlaceholder': 'What are your main objectives for entering the UK market? Any specific challenges you\'re facing?',
    'leadForm.namePlaceholder': 'Your full name',
    'leadForm.emailPlaceholder': 'your.email@company.com',
    'leadForm.phonePlaceholder': '+90 xxx xxx xxxx',
    'leadForm.companyPlaceholder': 'Your company name',
    'leadForm.submit': 'Get My Free Analysis',
    'leadForm.processing': 'Processing...',
    'leadForm.privacy': 'By submitting this form, you agree to receive communications from Business Bridge. We respect your privacy and will never spam you.',
    'leadForm.successTitle': 'Thank you for your interest!',
    'leadForm.successDesc': 'We\'ll be in touch within 24 hours with your personalized business insights.',
    'leadForm.errorTitle': 'Something went wrong',
    'leadForm.errorDesc': 'Please try again or contact our support team.',
    
    // Industries
    'industry.technology': 'Technology',
    'industry.manufacturing': 'Manufacturing',
    'industry.retail': 'Retail & E-commerce',
    'industry.foodBeverage': 'Food & Beverage',
    'industry.textiles': 'Textiles & Fashion',
    'industry.healthcare': 'Healthcare',
    'industry.construction': 'Construction',
    'industry.automotive': 'Automotive',
    'industry.finance': 'Finance',
    'industry.consulting': 'Consulting',
    'industry.other': 'Other',
    
    // Interests
    'interest.ukMarketEntry': 'UK Market Entry',
    'interest.businessAnalysis': 'Business Analysis',
    'interest.partnerMatching': 'Partner Matching',
    'interest.complianceSupport': 'Compliance Support',
    'interest.financialPlanning': 'Financial Planning',
    'interest.digitalMarketing': 'Digital Marketing'
  },
  tr: {
    // Header
    'nav.features': 'Özellikler',
    'nav.pricing': 'Fiyatlandırma',
    'nav.support': 'Destek',
    'nav.login': 'Giriş Yap',
    'nav.getStarted': 'Başlayın',
    'nav.partners': 'Ortaklar',
    'nav.admin': 'Yönetici',
    'nav.dashboard': 'Kontrol Paneline Git',

    // Hero Section
    'hero.badge': 'AI Destekli İş Zekası',
    'hero.title': 'Akıllı Analitikle Pazar Girişini Hızlandırın',
    'hero.description': 'AI destekli içgörülerle işinizin kapsamlı analizini alın. Pazar konumunuzu anlayın, fırsatları belirleyin ve veriye dayalı kararlar alın.',
    'hero.startJourney': 'Analizinizi Başlatın',
    'hero.watchDemo': 'Demo İzleyin',

    // Features Section
    'features.title': 'İş Büyümesi İçin Güçlü Özellikler',
    'features.subtitle': 'İşinizi analiz etmek, anlamak ve büyütmek için ihtiyacınız olan her şey',
    'features.aiScore': 'AI Destekli Analiz',
    'features.aiScoreDesc': 'Gelişmiş yapay zeka, iş verilerinizi analiz ederek eylem odaklı içgörüler sağlar',
    'features.docGenerator': 'Kapsamlı Raporlar',
    'features.docGeneratorDesc': 'Pazar analizi, rekabet ortamı ve büyüme fırsatlarını kapsayan detaylı raporlar alın',
    'features.partnerMatching': 'Partner Eşleştirme',
    'features.partnerMatchingDesc': 'İhtiyaçlarınıza özel doğrulanmış iş ortakları ve hizmet sağlayıcılarıyla bağlantı kurun',
    'features.smartRoadmap': 'Akıllı Yol Haritası',
    'features.smartRoadmapDesc': 'İş hedeflerinize ulaşmak için eylem odaklı adımlarla kişiselleştirilmiş yol haritası alın',

    // How It Works Section
    'howItWorks.title': 'Nasıl Çalışır',
    'howItWorks.subtitle': 'Üç basit adımda iş analizinizi başlatın',
    'howItWorks.step1': 'İş Bilgilerinizi Paylaşın',
    'howItWorks.step1Desc': 'Basit formumuz aracılığıyla işiniz, hedefleriniz ve mevcut zorluklarınız hakkında bize bilgi verin',
    'howItWorks.step2': 'AI Analizini Alın',
    'howItWorks.step2Desc': 'AI\'mız iş verilerinizi analiz eder ve kapsamlı içgörüler ve öneriler üretir',
    'howItWorks.step3': 'Harekete Geçin',
    'howItWorks.step3Desc': 'Kişiselleştirilmiş yol haritanızı takip edin ve işinizi büyütmek için önerilen ortaklarla bağlantı kurun',

    // CTA Section
    'cta.title': 'İşinizi Dönüştürmeye Hazır mısınız?',
    'cta.description': 'AI destekli platformumuzla büyüme potansiyellerini keşfetmiş binlerce işletmeye katılın',
    'cta.startAnalysis': 'Ücretsiz Analiz Başlatın',
    'cta.scheduleConsult': 'Konsültasyon Planlayın',
    'cta.leadFormTitle': 'Kapsamlı Pazar Analizinizi Alın',
    'cta.leadFormDesc': 'AI destekli içgörüler ve doğrulanmış partner önerileriyle UK pazar potansiyelinizi keşfedin',

    // Footer
    'footer.description': 'İşletmeleri AI destekli içgörüler ve stratejik rehberlikle sürdürülebilir büyüme için güçlendiriyoruz',
    'footer.platform': 'Platform',
    'footer.support': 'Destek',
    'footer.legal': 'Yasal',
    'footer.features': 'Özellikler',
    'footer.pricing': 'Fiyatlandırma',
    'footer.api': 'API',
    'footer.helpCenter': 'Yardım Merkezi',
    'footer.contact': 'İletişim',
    'footer.community': 'Topluluk',
    'footer.privacy': 'Gizlilik',
    'footer.terms': 'Şartlar',
    'footer.cookies': 'Çerezler',
    'footer.copyright': '© 2024 Business Bridge. Tüm hakları saklıdır.',

    // Guest Analysis Form
    'analysis.form.title': 'Ücretsiz AI İş Analizinizi Alın',
    'analysis.form.subtitle': 'İşiniz için kapsamlı içgörüler ve öneriler alın',
    'analysis.form.email': 'E-posta Adresi',
    'analysis.form.companyName': 'Şirket Adı',
    'analysis.form.businessDesc': 'İş Tanımı',
    'analysis.form.businessDescPlaceholder': 'İşinizi, ürünlerinizi/hizmetlerinizi ve hedef pazarınızı açıklayın...',
    'analysis.form.industry': 'Sektör',
    'analysis.form.selectIndustry': 'Sektör seçin',
    'analysis.form.companySize': 'Şirket Büyüklüğü',
    'analysis.form.selectSize': 'Büyüklük seçin',
    'analysis.form.websiteUrl': 'Web Sitesi URL (İsteğe Bağlı)',
    'analysis.form.whatYouGet': 'Neler alacaksınız:',
    'analysis.form.benefit1': 'Kapsamlı AI iş analizi',
    'analysis.form.benefit2': 'UK pazar hazırlık skoru',
    'analysis.form.benefit3': 'İş önerileri ve içgörüler',
    'analysis.form.benefit4': 'Anında sonuçlar',
    'analysis.form.submit': 'Ücretsiz Analiz Al',
    'analysis.form.processing': 'Analiz İşleniyor...',
    'analysis.form.required': 'Gerekli Alanlar Eksik',
    'analysis.form.requiredDesc': 'Lütfen tüm gerekli alanları doldurun.',

    // Guest Analysis Page
    'analysis.page.backHome': 'Ana Sayfaya Dön',
    'analysis.page.title': 'AI İş Analizinizi Alın',
    'analysis.page.subtitle': 'UK pazar hazırlığınız hakkında kapsamlı içgörüler alın ve doğrulanmış partner dizinimize bağlanın - tamamen ücretsiz.',
    'analysis.page.aiTitle': 'AI Destekli Analiz',
    'analysis.page.aiDesc': 'Gelişmiş algoritmalar işinizi UK pazar hazırlığı için analiz eder',
    'analysis.page.reportTitle': 'Kapsamlı Rapor',
    'analysis.page.reportDesc': 'Detaylı içgörüler, öneriler ve büyüme fırsatları',
    'analysis.page.partnerTitle': 'Partner Erişimi',
    'analysis.page.partnerDesc': 'Doğrulanmış UK iş ortakları ve hizmet sağlayıcılarıyla bağlantı kurun',

    // Guest Results Page
    'results.complete': 'Analiz Tamamlandı!',
    'results.ready': 'AI iş analizi sonuçlarınız hazır.',
    'results.score': 'UK Pazar Hazırlık Skoru',
    'results.limited': 'Sınırlı Analiz',
    'results.upgrade': 'Tam Analiz İçin Yükselt',
    'results.keyFindings': 'Önemli Bulgular',
    'results.recommendations': 'Öneriler',
    'results.riskFactors': 'Risk Faktörleri',
    'results.unlockFull': 'İşinizin Tam Potansiyelini Açın',
    'results.nextStep': 'Bir Sonraki Adıma Hazır mısınız?',
    'results.createAccount': 'Sonuçlarınızı kaydetmek, partner dizinimize erişmek ve kişiselleştirilmiş öneriler almak için bir hesap oluşturun.',
    'results.upgradePremium': 'Premium\'a Yükselt',
    'results.downloadReport': 'Raporu İndir',
    'results.downloadSummary': 'Özeti İndir',
    'results.generating': 'İş analiziniz oluşturuluyor...',
    'results.notFound': 'Analiz Bulunamadı',
    'results.notFoundDesc': 'Analiz sonuçlarınızı bulamadık. Lütfen destekle iletişime geçin.',
    'results.returnHome': 'Ana Sayfaya Dön',

    // Lead Capture Form
    'leadForm.defaultTitle': 'Ücretsiz İş Analizinizi Alın',
    'leadForm.defaultTitleAlt': 'UK Pazar Yolculuğunuza Başlayın',
    'leadForm.defaultDesc': 'AI destekli analizimizle UK pazar potansiyelinizi keşfedin. Kişiselleştirilmiş içgörüler ve partner önerileri alın.',
    'leadForm.defaultDescAlt': 'UK pazarına başarıyla genişleyen yüzlerce Türk işletmesine katılın.',
    'leadForm.incentive': 'Ücretsiz AI Analizi + Partner Eşleştirme Raporu (299£ Değerinde)',
    'leadForm.fullName': 'Ad Soyad',
    'leadForm.email': 'E-posta Adresi',
    'leadForm.phone': 'Telefon Numarası',
    'leadForm.company': 'Şirket Adı',
    'leadForm.industry': 'Sektör',
    'leadForm.selectIndustry': 'Sektörünüzü seçin',
    'leadForm.interests': 'İlgi Alanları',
    'leadForm.goals': 'Hedefleriniz hakkında bize bilgi verin',
    'leadForm.goalsPlaceholder': 'UK pazarına giriş için ana hedefleriniz nelerdir? Karşılaştığınız özel zorluklar var mı?',
    'leadForm.namePlaceholder': 'Adınız ve soyadınız',
    'leadForm.emailPlaceholder': 'e-posta@sirketiniz.com',
    'leadForm.phonePlaceholder': '+90 xxx xxx xxxx',
    'leadForm.companyPlaceholder': 'Şirketinizin adı',
    'leadForm.submit': 'Ücretsiz Analizimi Al',
    'leadForm.processing': 'İşleniyor...',
    'leadForm.privacy': 'Bu formu göndererek Business Bridge\'den iletişim almayı kabul ediyorsunuz. Gizliliğinize saygı duyuyoruz ve asla spam göndermeyeceğiz.',
    'leadForm.successTitle': 'İlginiz için teşekkür ederiz!',
    'leadForm.successDesc': '24 saat içinde kişiselleştirilmiş iş içgörülerinizle sizinle iletişime geçeceğiz.',
    'leadForm.errorTitle': 'Bir şeyler yanlış gitti',
    'leadForm.errorDesc': 'Lütfen tekrar deneyin veya destek ekibimizle iletişime geçin.',
    
    // Industries
    'industry.technology': 'Teknoloji',
    'industry.manufacturing': 'İmalat',
    'industry.retail': 'Perakende ve E-ticaret',
    'industry.foodBeverage': 'Gıda ve İçecek',
    'industry.textiles': 'Tekstil ve Moda',
    'industry.healthcare': 'Sağlık',
    'industry.construction': 'İnşaat',
    'industry.automotive': 'Otomotiv',
    'industry.finance': 'Finans',
    'industry.consulting': 'Danışmanlık',
    'industry.other': 'Diğer',
    
    // Interests
    'interest.ukMarketEntry': 'UK Pazar Girişi',
    'interest.businessAnalysis': 'İş Analizi',
    'interest.partnerMatching': 'Partner Eşleştirme',
    'interest.complianceSupport': 'Uyumluluk Desteği',
    'interest.financialPlanning': 'Finansal Planlama',
    'interest.digitalMarketing': 'Dijital Pazarlama'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};