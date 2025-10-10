import { GuestAnalysisForm } from "@/components/GuestAnalysisForm";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { BarChart3, ArrowLeft } from "lucide-react";

export default function GuestAnalysis() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-slate-900">Converta</span>
            </div>
            <Button onClick={() => navigate('/')} variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('analysis.page.backHome')}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            {t('analysis.page.title')}
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            {t('analysis.page.subtitle')}
          </p>
        </div>

        <GuestAnalysisForm />

        {/* Benefits Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t('analysis.page.aiTitle')}</h3>
            <p className="text-muted-foreground">
              {t('analysis.page.aiDesc')}
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">{t('analysis.page.reportTitle')}</h3>
            <p className="text-muted-foreground">
              {t('analysis.page.reportDesc')}
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🤝</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">{t('analysis.page.partnerTitle')}</h3>
            <p className="text-muted-foreground">
              {t('analysis.page.partnerDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}