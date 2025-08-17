import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, RefreshCw, Settings, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
}

interface SubscriptionStatusProps {
  onUpgrade?: () => void;
}

export function SubscriptionStatus({ onUpgrade }: SubscriptionStatusProps) {
  const [subscription, setSubscription] = useState<SubscriptionData>({ subscribed: false });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement subscription check
      // const { data, error } = await supabase.functions.invoke('check-subscription');
      
      // Mock data for now
      setSubscription({
        subscribed: false,
        subscription_tier: undefined,
        subscription_end: undefined
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      // TODO: Implement customer portal
      // const { data, error } = await supabase.functions.invoke('customer-portal');
      
      toast({
        title: "Coming Soon",
        description: "Subscription management will be available soon!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open subscription management.",
        variant: "destructive",
      });
    }
  };

  const getTierIcon = (tier?: string) => {
    switch (tier?.toLowerCase()) {
      case 'professional':
        return <Crown className="w-4 h-4" />;
      case 'enterprise':
        return <Zap className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getTierColor = (tier?: string) => {
    switch (tier?.toLowerCase()) {
      case 'professional':
        return 'bg-premium text-premium-foreground';
      case 'enterprise':
        return 'bg-gradient-premium text-premium-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Subscription Status</CardTitle>
            <CardDescription>
              Manage your plan and billing
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={checkSubscription}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Current Plan:</span>
            <Badge className={getTierColor(subscription.subscription_tier)}>
              {getTierIcon(subscription.subscription_tier)}
              {subscription.subscription_tier || 'Starter'}
            </Badge>
          </div>
          
          {subscription.subscribed && subscription.subscription_end && (
            <span className="text-xs text-muted-foreground">
              Renews {new Date(subscription.subscription_end).toLocaleDateString()}
            </span>
          )}
        </div>

        {!subscription.subscribed && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              You're currently on the free Starter plan with limited features.
            </p>
            <Button size="sm" onClick={onUpgrade} className="w-full">
              Upgrade to Professional
            </Button>
          </div>
        )}

        {subscription.subscribed && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManageSubscription}
              className="flex-1"
            >
              <Settings className="w-4 h-4 mr-2" />
              Manage
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onUpgrade}
              className="flex-1"
            >
              Upgrade
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}