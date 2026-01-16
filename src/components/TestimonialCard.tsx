import { Quote, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  company: string;
  rating?: number;
  className?: string;
}

export function TestimonialCard({ 
  quote, 
  author, 
  role, 
  company, 
  rating = 5,
  className = '' 
}: TestimonialCardProps) {
  return (
    <Card className={`bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-1 mb-4">
          {Array.from({ length: rating }).map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-brand text-brand" />
          ))}
        </div>
        
        <div className="relative mb-6">
          <Quote className="absolute -top-2 -left-2 h-8 w-8 text-primary/10" />
          <p className="text-muted-foreground leading-relaxed italic pl-6">
            "{quote}"
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">
              {author.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">{author}</p>
            <p className="text-xs text-muted-foreground">{role}, {company}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
