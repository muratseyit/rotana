import { motion } from "framer-motion";

interface CollaborationBadgeProps {
  variant?: 'inline' | 'stacked' | 'hero';
  className?: string;
  showText?: boolean;
}

// UK Flag SVG Component
const UKFlag = ({ className = "w-6 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
    <clipPath id="uk-clip">
      <rect width="60" height="30" rx="2"/>
    </clipPath>
    <g clipPath="url(#uk-clip)">
      <rect width="60" height="30" fill="#012169"/>
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4" clipPath="url(#uk-cross)"/>
      <clipPath id="uk-cross">
        <polygon points="0,0 30,15 0,10"/>
        <polygon points="0,30 30,15 0,20"/>
        <polygon points="60,0 30,15 60,10"/>
        <polygon points="60,30 30,15 60,20"/>
      </clipPath>
      <path d="M30,0 V30 M0,15 H60" stroke="#fff" strokeWidth="10"/>
      <path d="M30,0 V30 M0,15 H60" stroke="#C8102E" strokeWidth="6"/>
    </g>
  </svg>
);

// Turkey Flag SVG Component
const TurkeyFlag = ({ className = "w-6 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">
    <rect width="60" height="40" fill="#E30A17" rx="2"/>
    <circle cx="22.5" cy="20" r="10" fill="#fff"/>
    <circle cx="25" cy="20" r="8" fill="#E30A17"/>
    <polygon 
      fill="#fff" 
      points="38,20 32.5,22 33.5,17 29.5,14 35,13.5 38,9 41,13.5 46.5,14 42.5,17 43.5,22"
    />
  </svg>
);

export function CollaborationBadge({ 
  variant = 'inline', 
  className = '',
  showText = true 
}: CollaborationBadgeProps) {
  
  if (variant === 'hero') {
    return (
      <motion.div 
        className={`flex flex-col items-center gap-3 ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="flex items-center gap-4">
          <motion.div 
            className="relative"
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="p-2 rounded-lg bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg">
              <TurkeyFlag className="w-10 h-7 rounded-sm shadow-sm" />
            </div>
          </motion.div>
          
          <div className="flex items-center gap-1">
            <motion.div 
              className="w-2 h-2 rounded-full bg-primary/60"
              animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
            />
            <motion.div 
              className="w-8 h-0.5 bg-gradient-to-r from-primary/40 via-primary to-primary/40"
              animate={{ scaleX: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div 
              className="w-2 h-2 rounded-full bg-primary/60"
              animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            />
          </div>
          
          <motion.div 
            className="relative"
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            <div className="p-2 rounded-lg bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg">
              <UKFlag className="w-10 h-7 rounded-sm shadow-sm" />
            </div>
          </motion.div>
        </div>
        
        {showText && (
          <motion.p 
            className="text-sm font-medium text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Turkey → UK Trade Corridor
          </motion.p>
        )}
      </motion.div>
    );
  }
  
  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-md bg-card border border-border/50 shadow-sm">
            <TurkeyFlag className="w-8 h-5 rounded-sm" />
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
            <div className="w-6 h-0.5 bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30" />
            <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
          </div>
          <div className="p-1.5 rounded-md bg-card border border-border/50 shadow-sm">
            <UKFlag className="w-8 h-5 rounded-sm" />
          </div>
        </div>
        {showText && (
          <p className="text-xs font-medium text-muted-foreground">
            UK-Turkey Trade Bridge
          </p>
        )}
      </div>
    );
  }
  
  // inline variant (default)
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/80 border border-border/50 backdrop-blur-sm ${className}`}>
      <TurkeyFlag className="w-5 h-3.5 rounded-[2px]" />
      <span className="text-xs text-muted-foreground">↔</span>
      <UKFlag className="w-5 h-3.5 rounded-[2px]" />
      {showText && (
        <span className="text-xs font-medium text-muted-foreground ml-1">Trade Corridor</span>
      )}
    </div>
  );
}
