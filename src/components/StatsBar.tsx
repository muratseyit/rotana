import { AnimatedCounter } from "@/components/AnimatedCounter";
import { useLanguage } from "@/contexts/LanguageContext";
import { TrendingUp, Users, Building2, Award } from "lucide-react";

interface StatsBarProps {
  className?: string;
}

export function StatsBar({ className = '' }: StatsBarProps) {
  const { t } = useLanguage();

  const stats = [
    { 
      icon: Building2, 
      value: 500, 
      suffix: '+', 
      label: t('stats.businessesAnalyzed') || 'Businesses Analyzed',
      color: 'text-primary'
    },
    { 
      icon: TrendingUp, 
      value: 87, 
      suffix: '%', 
      label: t('stats.successRate') || 'Success Rate',
      color: 'text-success'
    },
    { 
      icon: Users, 
      value: 45, 
      suffix: '+', 
      label: t('stats.verifiedPartners') || 'Verified UK Partners',
      color: 'text-brand'
    },
    { 
      icon: Award, 
      value: 15, 
      suffix: 'M+', 
      prefix: '£', 
      label: t('stats.tradeVolume') || 'Trade Volume Facilitated',
      color: 'text-primary'
    },
  ];

  return (
    <section className={`py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-background via-accent/5 to-background border-y border-border/30 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="text-center group animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-center mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                <AnimatedCounter 
                  end={stat.value} 
                  prefix={stat.prefix || ''} 
                  suffix={stat.suffix} 
                />
              </div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
