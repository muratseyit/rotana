import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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
  location: string | null;
  verification_status: string;
  created_by: string | null;
  created_at: string;
  verified_at: string | null;
}

export default function AdminPartners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPartners(data || []);
    } catch (error) {
      console.error("Error fetching partners:", error);
      toast({
        title: "Error",
        description: "Failed to load partners.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updatePartnerStatus = async (partnerId: string, status: 'verified' | 'rejected') => {
    setIsUpdating(partnerId);
    try {
      const updates: any = { 
        verification_status: status 
      };
      
      if (status === 'verified') {
        updates.verified_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("partners")
        .update(updates)
        .eq("id", partnerId);

      if (error) throw error;

      toast({
        title: `Partner ${status}`,
        description: `Partner application has been ${status}.`,
      });

      fetchPartners();
    } catch (error) {
      console.error("Error updating partner:", error);
      toast({
        title: "Error",
        description: "Failed to update partner status.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const pendingPartners = partners.filter(p => p.verification_status === 'pending');
  const verifiedPartners = partners.filter(p => p.verification_status === 'verified');
  const rejectedPartners = partners.filter(p => p.verification_status === 'rejected');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading partners...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole="admin">
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
                    Manage partner applications and verifications
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={() => window.history.back()}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-6 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{partners.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingPartners.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Verified Partners</CardTitle>
                <Check className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{verifiedPartners.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                <X className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{rejectedPartners.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Partners Table */}
          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList>
              <TabsTrigger value="pending">Pending ({pendingPartners.length})</TabsTrigger>
              <TabsTrigger value="verified">Verified ({verifiedPartners.length})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({rejectedPartners.length})</TabsTrigger>
              <TabsTrigger value="all">All ({partners.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Applications</CardTitle>
                  <CardDescription>
                    Partner applications awaiting review and verification
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PartnerTable 
                    partners={pendingPartners} 
                    onUpdateStatus={updatePartnerStatus}
                    isUpdating={isUpdating}
                    showActions={true}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="verified">
              <Card>
                <CardHeader>
                  <CardTitle>Verified Partners</CardTitle>
                  <CardDescription>
                    Partners that have been verified and are live in the directory
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PartnerTable partners={verifiedPartners} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rejected">
              <Card>
                <CardHeader>
                  <CardTitle>Rejected Applications</CardTitle>
                  <CardDescription>
                    Partner applications that have been rejected
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PartnerTable partners={rejectedPartners} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="all">
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
    </ProtectedRoute>
  );
}

interface PartnerTableProps {
  partners: Partner[];
  onUpdateStatus?: (partnerId: string, status: 'verified' | 'rejected') => void;
  isUpdating?: string | null;
  showActions?: boolean;
}

function PartnerTable({ partners, onUpdateStatus, isUpdating, showActions = false }: PartnerTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
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
          <TableHead>Name</TableHead>
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
                <div className="text-sm text-muted-foreground line-clamp-1">
                  {partner.description}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="capitalize">
                {partner.category}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                {partner.contact_email && (
                  <div>{partner.contact_email}</div>
                )}
                {partner.phone && (
                  <div className="text-muted-foreground">{partner.phone}</div>
                )}
              </div>
            </TableCell>
            <TableCell>
              {getStatusBadge(partner.verification_status)}
            </TableCell>
            <TableCell>
              <div className="text-sm">
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
                    className="h-8 w-8 p-0"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onUpdateStatus?.(partner.id, 'rejected')}
                    disabled={isUpdating === partner.id}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
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