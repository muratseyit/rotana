import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface NewsletterSignupProps {
  variant?: 'light' | 'dark';
  className?: string;
}

export function NewsletterSignup({ variant = 'dark', className = '' }: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('subscribers')
        .insert([{ email, subscribed: true }]);

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already subscribed",
            description: "This email is already on our list!",
          });
        } else {
          throw error;
        }
      } else {
        setIsSubscribed(true);
        toast({
          title: "Successfully subscribed!",
          description: "You'll receive updates about UK market expansion.",
        });
        setEmail('');
      }
    } catch (error) {
      console.error('Newsletter signup error:', error);
      toast({
        title: "Subscription failed",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBg = variant === 'dark' ? 'bg-background/10 border-background/20 text-background placeholder:text-background/50' : 'bg-background border-border';
  const buttonStyle = variant === 'dark' ? 'bg-background text-foreground hover:bg-background/90' : '';

  if (isSubscribed) {
    return (
      <div className={`flex items-center gap-2 ${variant === 'dark' ? 'text-background' : 'text-foreground'} ${className}`}>
        <CheckCircle className="h-5 w-5 text-success" />
        <span className="text-sm">You're subscribed! Check your inbox.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
      <div className="relative flex-1">
        <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${variant === 'dark' ? 'text-background/50' : 'text-muted-foreground'}`} />
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`pl-10 ${inputBg}`}
          disabled={isSubmitting}
        />
      </div>
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className={buttonStyle}
        size="default"
      >
        {isSubmitting ? (
          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <ArrowRight className="h-4 w-4" />
        )}
      </Button>
    </form>
  );
}
