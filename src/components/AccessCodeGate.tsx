import { useState } from 'react';
import { useAccessCode } from '@/contexts/AccessCodeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Lock, CheckCircle, TrendingUp, Users, FileText } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6 shadow-xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {t('accessGate.title')}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t('accessGate.description')}
          </p>
        </div>

        {/* Access Code Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="access-code">{t('accessGate.codeLabel')}</Label>
            <Input
              id="access-code"
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError(false);
              }}
              placeholder={t('accessGate.codePlaceholder')}
              className={error ? 'border-destructive' : ''}
              disabled={isSubmitting}
              autoFocus
            />
            {error && (
              <p className="text-sm text-destructive">
                {t('accessGate.errorMessage')}
              </p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={!code.trim() || isSubmitting}
          >
            {isSubmitting ? t('accessGate.verifying') : t('accessGate.submitButton')}
          </Button>
        </form>

        {/* Features List */}
        <div className="pt-4 border-t space-y-3">
          <p className="text-sm font-medium text-center">
            {t('accessGate.accessIncludes')}
          </p>
          <div className="space-y-2">
            <div className="flex items-start gap-3 text-sm">
              <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">{t('accessGate.feature1')}</span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <TrendingUp className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">{t('accessGate.feature2')}</span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <Users className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">{t('accessGate.feature3')}</span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <FileText className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">{t('accessGate.feature4')}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 text-center">
          <p className="text-xs text-muted-foreground">
            {t('accessGate.contactNote')}
          </p>
        </div>
      </Card>
    </div>
  );
};
