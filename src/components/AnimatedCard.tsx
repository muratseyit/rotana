import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { cn } from "@/lib/utils";
import * as React from "react";

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  animation?: "fade-up" | "slide-left" | "slide-right" | "scale";
  delay?: number;
}

export function AnimatedCard({ 
  children, 
  className, 
  animation = "fade-up",
  delay = 0,
  ...props 
}: AnimatedCardProps) {
  const { ref, isVisible } = useIntersectionObserver();

  const animationClass = {
    "fade-up": "animate-fade-in-up",
    "slide-left": "animate-slide-in-left", 
    "slide-right": "animate-slide-in-right",
    "scale": "animate-scale-in"
  }[animation];

  const delayClass = delay > 0 ? `animate-delay-${delay}` : "";

  return (
    <div ref={ref}>
      <Card 
        className={cn(
          "transition-all duration-300",
          isVisible ? `${animationClass} ${delayClass}` : "opacity-0",
          className
        )}
        {...props}
      >
        {children}
      </Card>
    </div>
  );
}