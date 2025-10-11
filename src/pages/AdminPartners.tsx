import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Shield, Check, X, Eye, Clock, Users } from "lucide-react";

interface Partner {
  id: string;
  name: string;
  description: string;
  category: string;
  specialties: string[];
  website_url: string | null;
  contact_email: string | null;
  phone: string | null;
  verification_status: 'pending' | 'verified' | 'rejected';
  created_at: string;
  updated_at: string;
}

export default function AdminPartners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          toast({
            title: "Authentication Required",
            description: "Please log in to access partner management.",
            variant: "destructive"
          });
          navigate('/');
          return;
        }

        const { data: roles, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin');

        if (roleError || !roles || roles.length === 0) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to access this page.",
            variant: "destructive"
          });
          navigate('/');
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Auth check error:', error);
        navigate('/');
      }
    };

    checkAuth();
  }, [navigate, toast]);

  useEffect(() => {
    if (isAuthorized) {
      fetchPartners();
    }
  }, [isAuthorized]);

  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setPartners(data as Partner[] || []);
    } catch (error) {
      console.error("Error fetching partners:", error);
      toast({
        title: "Error",
        description: "Failed to load partners",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updatePartnerStatus = async (partnerId: string, status: 'verified' | 'rejected') => {
    setUpdatingStatus(partnerId);
    
    try {
      const { error } = await supabase
        .from("partners")
        .update({ verification_status: status, updated_at: new Date().toISOString() })
        .eq("id", partnerId);

      if (error) throw error;

      setPartners(prev => 
        prev.map(partner => 
          partner.id === partnerId 
            ? { ...partner, verification_status: status, updated_at: new Date().toISOString() }
            : partner
        )
      );

      toast({
        title: "Status Updated",
        description: `Partner has been ${status}`,
      });
    } catch (error) {
      console.error("Error updating partner status:", error);
      toast({
        title: "Error",
        description: "Failed to update partner status",
        variant: "destructive"
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'verified': return 'default';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <Check className="h-4 w-4" />;
      case 'rejected': return <X className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const pendingPartners = partners.filter(p => p.verification_status === 'pending');
  const verifiedPartners = partners.filter(p => p.verification_status === 'verified');
  const rejectedPartners = partners.filter(p => p.verification_status === 'rejected');

  if (isLoading || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{!isAuthorized ? "Verifying access..." : "Loading partners..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Partner Administration</h1>
                <p className="text-sm text-muted-foreground">
                  Manage and verify partner applications
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Users className="h-3 w-3" />
                {partners.length} Total Partners
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              Pending ({pendingPartners.length})
            </TabsTrigger>
            <TabsTrigger value="verified" className="gap-2">
              <Check className="h-4 w-4" />
              Verified ({verifiedPartners.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-2">
              <X className="h-4 w-4" />
              Rejected ({rejectedPartners.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-2">
              <Eye className="h-4 w-4" />
              All Partners
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Applications</CardTitle>
                <CardDescription>
                  Review and approve new partner applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PartnerTable 
                  partners={pendingPartners} 
                  onUpdateStatus={updatePartnerStatus}
                  isUpdating={updatingStatus}
                  showActions={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verified" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Verified Partners</CardTitle>
                <CardDescription>
                  Active partners visible to users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PartnerTable partners={verifiedPartners} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejected" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Rejected Applications</CardTitle>
                <CardDescription>
                  Previously rejected partner applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PartnerTable partners={rejectedPartners} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>All Partners</CardTitle>
                <CardDescription>
                  Complete overview of all partner applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PartnerTable partners={partners} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

interface PartnerTableProps {
  partners: Partner[];
  onUpdateStatus?: (partnerId: string, status: 'verified' | 'rejected') => void;
  isUpdating?: string | null;
  showActions?: boolean;
}

function PartnerTable({ partners, onUpdateStatus, isUpdating, showActions = false }: PartnerTableProps) {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'verified': return 'default';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <Check className="h-4 w-4" />;
      case 'rejected': return <X className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (partners.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No partners found</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Partner</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Applied</TableHead>
          {showActions && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {partners.map((partner) => (
          <TableRow key={partner.id}>
            <TableCell>
              <div>
                <div className="font-medium">{partner.name}</div>
                <div className="text-sm text-muted-foreground line-clamp-2">
                  {partner.description}
                </div>
                {partner.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {partner.specialties.slice(0, 3).map((specialty, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                    {partner.specialties.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{partner.specialties.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{partner.category}</Badge>
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                {partner.contact_email && (
                  <div className="text-sm">{partner.contact_email}</div>
                )}
                {partner.phone && (
                  <div className="text-sm text-muted-foreground">{partner.phone}</div>
                )}
                {partner.website_url && (
                  <a 
                    href={partner.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Website
                  </a>
                )}
              </div>
            </TableCell>
            <TableCell>
              <Badge 
                variant={getStatusBadgeVariant(partner.verification_status)}
                className="gap-1"
              >
                {getStatusIcon(partner.verification_status)}
                {partner.verification_status}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="text-sm text-muted-foreground">
                {new Date(partner.created_at).toLocaleDateString()}
              </div>
            </TableCell>
            {showActions && (
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => onUpdateStatus?.(partner.id, 'verified')}
                    disabled={isUpdating === partner.id}
                    className="gap-1"
                  >
                    <Check className="h-3 w-3" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onUpdateStatus?.(partner.id, 'rejected')}
                    disabled={isUpdating === partner.id}
                    className="gap-1"
                  >
                    <X className="h-3 w-3" />
                    Reject
                  </Button>
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}