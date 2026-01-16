import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center space-x-2">
      <Globe className="h-4 w-4 text-slate-600" />
      <div className="flex space-x-1">
        <Button
          variant={language === 'en' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setLanguage('en')}
          className="text-xs px-2 py-1 flex items-center gap-1"
        >
          <span className="text-sm">🇬🇧</span> EN
        </Button>
        <Button
          variant={language === 'tr' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setLanguage('tr')}
          className="text-xs px-2 py-1"
        >
          TR
        </Button>
      </div>
    </div>
  );
};

export default LanguageSwitcher;