import { Shield, Building2, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface TrustBadgesProps {
  variant?: 'light' | 'dark';
  className?: string;
}

// Compact UK Flag SVG
const UKFlagSmall = () => (
  <svg className="w-4 h-3 rounded-[1px]" viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
    <rect width="60" height="30" fill="#012169"/>
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
    <path d="M30,0 V30 M0,15 H60" stroke="#fff" strokeWidth="10"/>
    <path d="M30,0 V30 M0,15 H60" stroke="#C8102E" strokeWidth="6"/>
  </svg>
);

// Compact Turkey Flag SVG
const TurkeyFlagSmall = () => (
  <svg className="w-4 h-3 rounded-[1px]" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">
    <rect width="60" height="40" fill="#E30A17"/>
    <circle cx="22.5" cy="20" r="10" fill="#fff"/>
    <circle cx="25" cy="20" r="8" fill="#E30A17"/>
    <polygon 
      fill="#fff" 
      points="38,20 32.5,22 33.5,17 29.5,14 35,13.5 38,9 41,13.5 46.5,14 42.5,17 43.5,22"
    />
  </svg>
);

export function TrustBadges({ variant = 'light', className = '' }: TrustBadgesProps) {
  const { t } = useLanguage();
  
  const badges = [
    { icon: Shield, label: "GDPR Compliant" },
    { icon: Building2, label: "Companies House Verified" },
    { icon: CheckCircle, label: "ISO 27001" },
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
      {/* UK-Turkey Trade Badge with Flags */}
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-full border ${borderColor} bg-background/5 backdrop-blur-sm`}
      >
        <TurkeyFlagSmall />
        <span className="text-[10px] text-muted-foreground/60">↔</span>
        <UKFlagSmall />
        <span className={`text-xs font-medium ${textColor}`}>Trade Corridor</span>
      </div>
    </div>
  );
}