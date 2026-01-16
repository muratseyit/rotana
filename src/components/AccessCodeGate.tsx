import { useState } from 'react';
import { useAccessCode } from '@/contexts/AccessCodeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Lock, CheckCircle, TrendingUp, Users, FileText, BarChart3, Shield, Sparkles } from 'lucide-react';

export const AccessCodeGate = () => {
  const { validateCode } = useAccessCode();
  const { t } = useLanguage();
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(false);

    setTimeout(() => {
      const isValid = validateCode(code);
      if (!isValid) {
        setError(true);
        setCode('');
      }
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/20 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-brand/5 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/3 to-transparent rounded-full" />

      <div className="relative w-full max-w-lg">
        {/* Logo and branding */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-xl mb-4">
            <BarChart3 className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Converta</h1>
          <p className="text-muted-foreground mt-2">UK Market Entry Platform</p>
        </div>

        <Card className="w-full p-8 shadow-2xl border-border/50 bg-card/95 backdrop-blur-sm animate-fade-in-up animate-delay-100">
          {/* Header */}
          <div className="text-center space-y-3 mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 mb-2">
              <Lock className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground">
              {t('accessGate.title')}
            </h2>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              {t('accessGate.description')}
            </p>
          </div>

          {/* Access Code Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="access-code" className="text-sm font-medium">
                {t('accessGate.codeLabel')}
              </Label>
              <Input
                id="access-code"
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError(false);
                }}
                placeholder={t('accessGate.codePlaceholder')}
                className={`h-12 text-center text-lg tracking-widest font-medium transition-all ${
                  error 
                    ? 'border-destructive focus:ring-destructive/20' 
                    : 'border-border focus:border-primary focus:ring-primary/20'
                }`}
                disabled={isSubmitting}
                autoFocus
              />
              {error && (
                <p className="text-sm text-destructive flex items-center gap-2 justify-center mt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                  {t('accessGate.errorMessage')}
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300" 
              disabled={!code.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  {t('accessGate.verifying')}
                </span>
              ) : (
                t('accessGate.submitButton')
              )}
            </Button>
          </form>

          {/* Features List */}
          <div className="pt-8 mt-8 border-t border-border/50">
            <p className="text-sm font-medium text-center text-foreground mb-5">
              {t('accessGate.accessIncludes')}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: CheckCircle, text: t('accessGate.feature1') },
                { icon: TrendingUp, text: t('accessGate.feature2') },
                { icon: Users, text: t('accessGate.feature3') },
                { icon: FileText, text: t('accessGate.feature4') },
              ].map((feature, i) => (
                <div 
                  key={i} 
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-secondary/50 hover:bg-secondary/80 transition-colors"
                >
                  <feature.icon className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-muted-foreground leading-relaxed">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center animate-fade-in-up animate-delay-200">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
            <Shield className="h-3.5 w-3.5" />
            {t('accessGate.contactNote')}
          </p>
        </div>
      </div>
    </div>
  );
};