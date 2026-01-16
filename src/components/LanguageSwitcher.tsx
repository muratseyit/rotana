import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1">
      <Button
        variant={language === 'en' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setLanguage('en')}
        className="text-xs px-2 py-1 flex items-center gap-1"
      >
        <span className="text-sm">🇬🇧</span>
        EN
      </Button>
      <Button
        variant={language === 'tr' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setLanguage('tr')}
        className="text-xs px-2 py-1 flex items-center gap-1"
      >
        <span className="text-sm">🇹🇷</span>
        TR
      </Button>
    </div>
  );
};

export default LanguageSwitcher;