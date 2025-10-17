import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Mail, Phone, MapPin, Globe } from "lucide-react";

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
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {partner.logo_url && (
              <img 
                src={partner.logo_url} 
                alt={`${partner.name} logo`}
                className="w-12 h-12 rounded-lg object-cover"
              />
            )}
            <div>
              <CardTitle className="text-xl font-semibold">{partner.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="capitalize">
                  {partner.category}
                </Badge>
                {partner.verification_status === 'verified' && (
                  <Badge variant="secondary" className="text-xs">
                    Verified Partner
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <CardDescription className="line-clamp-3">
          {partner.description}
        </CardDescription>

        {/* Specialties */}
        {partner.specialties && partner.specialties.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Specialties</h4>
            <div className="flex flex-wrap gap-1">
              {partner.specialties.slice(0, 3).map((specialty, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {specialty}
                </Badge>
              ))}
              {partner.specialties.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{partner.specialties.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Contact Information */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Contact</h4>
          <div className="space-y-1">
            {partner.location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {partner.location}
              </div>
            )}
            {partner.contact_email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-3 w-3" />
                {partner.contact_email}
              </div>
            )}
            {partner.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-3 w-3" />
                {partner.phone}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {partner.contact_email && (
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1"
              onClick={() => window.open(`mailto:${partner.contact_email}`, '_blank')}
            >
              <Mail className="h-3 w-3 mr-1" />
              Contact
            </Button>
          )}
          {partner.website_url && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => window.open(partner.website_url!, '_blank')}
            >
              <Globe className="h-3 w-3 mr-1" />
              Website
            </Button>
          )}
        </div>

        {/* Verification Info */}
        <div className="pt-2 border-t text-xs text-muted-foreground">
          Verified {partner.verified_at ? new Date(partner.verified_at).toLocaleDateString() : 'recently'}
        </div>
      </CardContent>
    </Card>
  );
}