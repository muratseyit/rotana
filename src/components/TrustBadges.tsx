import { Shield, Building2, CheckCircle, Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface TrustBadgesProps {
  variant?: 'light' | 'dark';
  className?: string;
}

export function TrustBadges({ variant = 'light', className = '' }: TrustBadgesProps) {
  const { t } = useLanguage();
  
  const badges = [
    { icon: Shield, label: "GDPR Compliant" },
    { icon: Building2, label: "Companies House Verified" },
    { icon: CheckCircle, label: "ISO 27001" },
    { icon: Globe, label: "UK-Turkey Trade" },
  ];

  const textColor = variant === 'dark' ? 'text-background/80' : 'text-muted-foreground';
  const iconColor = variant === 'dark' ? 'text-background/60' : 'text-primary/60';
  const borderColor = variant === 'dark' ? 'border-background/20' : 'border-border';

  return (
    <div className={`flex flex-wrap items-center justify-center gap-4 ${className}`}>
      {badges.map((badge, index) => (
        <div
          key={index}
          className={`flex items-center gap-2 px-3 py-2 rounded-full border ${borderColor} bg-background/5 backdrop-blur-sm`}
        >
          <badge.icon className={`h-4 w-4 ${iconColor}`} />
          <span className={`text-xs font-medium ${textColor}`}>{badge.label}</span>
        </div>
      ))}
    </div>
  );
}