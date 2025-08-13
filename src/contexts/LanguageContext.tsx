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

    // Hero Section
    'hero.badge': 'AI-Powered Business Intelligence',
    'hero.title': 'Transform Your Business with Smart Analytics',
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

    // Footer
    'footer.description': 'Empowering businesses with AI-driven insights and strategic guidance for sustainable growth',
    'footer.platform': 'Platform',
    'footer.support': 'Support',
    'footer.legal': 'Legal',
    'footer.api': 'API',
    'footer.helpCenter': 'Help Center',
    'footer.contact': 'Contact',
    'footer.community': 'Community',
    'footer.privacy': 'Privacy',
    'footer.terms': 'Terms',
    'footer.cookies': 'Cookies',
    'footer.copyright': '© 2024 Business Bridge. All rights reserved.'
  },
  tr: {
    // Header
    'nav.features': 'Özellikler',
    'nav.pricing': 'Fiyatlandırma',
    'nav.support': 'Destek',
    'nav.login': 'Giriş Yap',
    'nav.getStarted': 'Başlayın',

    // Hero Section
    'hero.badge': 'AI Destekli İş Zekası',
    'hero.title': 'İşinizi Akıllı Analitikle Dönüştürün',
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

    // Footer
    'footer.description': 'İşletmeleri AI destekli içgörüler ve stratejik rehberlikle sürdürülebilir büyüme için güçlendiriyoruz',
    'footer.platform': 'Platform',
    'footer.support': 'Destek',
    'footer.legal': 'Yasal',
    'footer.api': 'API',
    'footer.helpCenter': 'Yardım Merkezi',
    'footer.contact': 'İletişim',
    'footer.community': 'Topluluk',
    'footer.privacy': 'Gizlilik',
    'footer.terms': 'Şartlar',
    'footer.cookies': 'Çerezler',
    'footer.copyright': '© 2024 Business Bridge. Tüm hakları saklıdır.'
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