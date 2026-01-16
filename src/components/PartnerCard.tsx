import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Mail, Phone, MapPin, Globe, CheckCircle2, Calendar } from "lucide-react";

interface Partner {
  id: string;
  name: string;
  description: string;
  category: string;
  specialties: string[];
  website_url: string | null;
  contact_email: string | null;
  phone: string | null;
  location: string | null;
  logo_url: string | null;
  verification_status: string;
  verified_at: string | null;
  created_at: string;
}

interface PartnerCardProps {
  partner: Partner;
}

export function PartnerCard({ partner }: PartnerCardProps) {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      accounting: "bg-primary/10 text-primary border-primary/20",
      legal: "bg-success/10 text-success border-success/20",
      marketing: "bg-accent/10 text-accent-foreground border-accent/20",
      compliance: "bg-secondary text-secondary-foreground border-secondary",
      business_development: "bg-primary/10 text-primary border-primary/20",
      logistics: "bg-muted text-muted-foreground border-border",
    };
    return colors[category] || "bg-muted text-muted-foreground border-border";
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30 bg-card overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {partner.logo_url ? (
              <img 
                src={partner.logo_url} 
                alt={`${partner.name} logo`}
                className="w-12 h-12 rounded-xl object-cover border border-border shadow-sm flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
                <span className="text-lg font-semibold text-primary">
                  {partner.name.charAt(0)}
                </span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg font-semibold text-foreground truncate">{partner.name}</CardTitle>
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <Badge variant="outline" className={`capitalize text-xs ${getCategoryColor(partner.category)}`}>
                  {partner.category.replace('_', ' ')}
                </Badge>
                {partner.verification_status === 'verified' && (
                  <Badge className="text-xs bg-success/10 text-success border-success/20 gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <CardDescription className="line-clamp-2 text-sm leading-relaxed">
          {partner.description}
        </CardDescription>

        {/* Specialties */}
        {partner.specialties && partner.specialties.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Specialties</h4>
            <div className="flex flex-wrap gap-1.5">
              {partner.specialties.slice(0, 3).map((specialty, index) => (
                <Badge key={index} variant="secondary" className="text-xs bg-muted/50 hover:bg-muted">
                  {specialty}
                </Badge>
              ))}
              {partner.specialties.length > 3 && (
                <Badge variant="secondary" className="text-xs bg-muted/50">
                  +{partner.specialties.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Contact Information */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Contact</h4>
          <div className="space-y-1.5">
            {partner.location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{partner.location}</span>
              </div>
            )}
            {partner.contact_email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{partner.contact_email}</span>
              </div>
            )}
            {partner.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{partner.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {partner.contact_email && (
            <Button 
              size="sm" 
              variant="default" 
              className="flex-1 gap-1.5"
              onClick={() => window.open(`mailto:${partner.contact_email}`, '_blank')}
            >
              <Mail className="h-3.5 w-3.5" />
              Contact
            </Button>
          )}
          {partner.website_url && (
            <Button 
              size="sm" 
              variant="outline"
              className="gap-1.5"
              onClick={() => window.open(partner.website_url!, '_blank')}
            >
              <Globe className="h-3.5 w-3.5" />
              Website
            </Button>
          )}
        </div>

        {/* Verification Info */}
        <div className="pt-3 border-t border-border/50 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>Verified {partner.verified_at ? new Date(partner.verified_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : 'recently'}</span>
        </div>
      </CardContent>
    </Card>
  );
}
