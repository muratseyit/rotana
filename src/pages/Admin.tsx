import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AdminAnalytics } from "@/components/AdminAnalytics";
import { AdminUserManagement } from "@/components/AdminUserManagement";
import AdminPartners from "@/pages/AdminPartners";
import { PerformanceMonitor } from "@/components/PerformanceMonitor";
import { AdminDataSources } from "@/components/AdminDataSources";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Activity, 
  Users, 
  Shield, 
  Zap, 
  ArrowLeft, 
  Settings,
  BarChart3,
  UserCheck,
  Clock,
  TrendingUp,
  Mail,
  Database
} from "lucide-react";
import { EmailMarketingIntegration } from "@/components/EmailMarketingIntegration";

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          toast({
            title: "Authentication Required",
            description: "Please log in to access the admin dashboard.",
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
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, toast]);

  if (isLoading || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{!isAuthorized ? "Verifying access..." : "Loading..."}</p>
        </div>
      </div>
    );
  }

  // Real admin statistics from database
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPartners: 0,
    pendingPartners: 0,
    totalAnalyses: 0,
    conversionRate: 0
  });

  const [recentActivity, setRecentActivity] = useState<{ type: string; message: string; time: string }[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [partnersRes, pendingRes, analysesRes, subscribersRes, recentAnalysesRes, recentPartnersRes] = await Promise.all([
          supabase.from('partners').select('id', { count: 'exact', head: true }).eq('verification_status', 'verified'),
          supabase.from('partners').select('id', { count: 'exact', head: true }).eq('verification_status', 'pending'),
          supabase.from('business_analysis_history').select('id', { count: 'exact', head: true }),
          supabase.from('subscribers').select('id', { count: 'exact', head: true }),
          supabase.from('business_analysis_history').select('created_at').order('created_at', { ascending: false }).limit(5),
          supabase.from('partners').select('name, created_at, verification_status').order('created_at', { ascending: false }).limit(5)
        ]);

        const totalPartners = partnersRes.count || 0;
        const pendingPartners = pendingRes.count || 0;
        const totalAnalyses = analysesRes.count || 0;
        const totalUsers = subscribersRes.count || 0;

        setStats({
          totalUsers,
          totalPartners,
          pendingPartners,
          totalAnalyses,
          conversionRate: totalUsers > 0 ? Math.round((totalAnalyses / totalUsers) * 100) / 10 : 0
        });

        // Build real recent activity from database
        const activity: { type: string; message: string; time: string }[] = [];
        
        (recentPartnersRes.data || []).forEach((partner: any) => {
          const status = partner.verification_status === 'pending' ? 'New partner application' : 'Partner verified';
          activity.push({
            type: 'partner',
            message: `${status}: ${partner.name}`,
            time: formatTimeAgo(partner.created_at)
          });
        });

        (recentAnalysesRes.data || []).forEach((analysis: any) => {
          activity.push({
            type: 'analysis',
            message: 'Business analysis completed',
            time: formatTimeAgo(analysis.created_at)
          });
        });

        // Sort by time and take top 5
        activity.sort((a, b) => parseTimeAgo(a.time) - parseTimeAgo(b.time));
        setRecentActivity(activity.slice(0, 5));

      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    if (isAuthorized) {
      fetchStats();
    }
  }, [isAuthorized]);

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const parseTimeAgo = (timeStr: string): number => {
    if (timeStr === 'Just now') return 0;
    const match = timeStr.match(/(\d+)/);
    if (!match) return 999;
    const num = parseInt(match[1]);
    if (timeStr.includes('minute')) return num;
    if (timeStr.includes('hour')) return num * 60;
    return num * 1440;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="gap-2 hidden sm:inline-flex"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Site
              </Button>
              <div className="flex items-center gap-2 sm:gap-3">
                <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold">Admin Dashboard</h1>
                  <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                    Converta Management Console
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="gap-1 sm:gap-2 text-xs">
                <Activity className="h-3 w-3" />
                <span className="hidden sm:inline">{stats.totalAnalyses} Analyses</span>
                <span className="sm:hidden">{stats.totalAnalyses}</span>
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="sm:hidden"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto pb-2">
            <TabsList className="inline-flex w-auto min-w-full sm:grid sm:w-full sm:grid-cols-7 h-auto">
              <TabsTrigger value="overview" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden lg:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-2">
                <Activity className="h-4 w-4" />
                <span className="hidden lg:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-2">
                <Users className="h-4 w-4" />
                <span className="hidden lg:inline">Users</span>
              </TabsTrigger>
              <TabsTrigger value="partners" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-2">
                <Shield className="h-4 w-4" />
                <span className="hidden lg:inline">Partners</span>
              </TabsTrigger>
              <TabsTrigger value="data-sources" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-2">
                <Database className="h-4 w-4" />
                <span className="hidden lg:inline">Data</span>
              </TabsTrigger>
              <TabsTrigger value="performance" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-2">
                <Zap className="h-4 w-4" />
                <span className="hidden lg:inline">Performance</span>
              </TabsTrigger>
              <TabsTrigger value="marketing" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-2">
                <Mail className="h-4 w-4" />
                <span className="hidden lg:inline">Marketing</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="mt-6">
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      <Badge variant="secondary" className="text-xs gap-1">
                        <TrendingUp className="h-3 w-3" />
                        +18% from last month
                      </Badge>
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalAnalyses.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      Business readiness reports
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Partners</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalPartners}</div>
                    <p className="text-xs text-muted-foreground">
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Clock className="h-3 w-3" />
                        {stats.pendingPartners} pending
                      </Badge>
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.conversionRate}%</div>
                    <p className="text-xs text-muted-foreground">
                      <Badge variant="default" className="text-xs">
                        Above industry average
                      </Badge>
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common administrative tasks and shortcuts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      variant="outline"
                      className="justify-start gap-2 h-auto p-4"
                      onClick={() => setActiveTab("partners")}
                    >
                      <Shield className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">Review Partners</div>
                        <div className="text-sm text-muted-foreground">
                          {stats.pendingPartners} applications pending
                        </div>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      className="justify-start gap-2 h-auto p-4"
                      onClick={() => setActiveTab("users")}
                    >
                      <Users className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">User Management</div>
                        <div className="text-sm text-muted-foreground">
                          Manage user accounts and activity
                        </div>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      className="justify-start gap-2 h-auto p-4"
                      onClick={() => setActiveTab("analytics")}
                    >
                      <Activity className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">View Analytics</div>
                        <div className="text-sm text-muted-foreground">
                          Platform performance insights
                        </div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest platform events and user interactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.length > 0 ? (
                      recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${
                              activity.type === 'partner' ? 'bg-blue-500' :
                              activity.type === 'user' ? 'bg-green-500' :
                              activity.type === 'analysis' ? 'bg-purple-500' :
                              'bg-gray-500'
                            }`} />
                            <span className="text-sm">{activity.message}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{activity.time}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No recent activity
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <AdminAnalytics />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <AdminUserManagement />
          </TabsContent>

          <TabsContent value="partners" className="mt-6">
            <AdminPartners />
          </TabsContent>

          <TabsContent value="data-sources" className="mt-6">
            <AdminDataSources />
          </TabsContent>

          <TabsContent value="performance" className="mt-6">
            <PerformanceMonitor />
          </TabsContent>

          <TabsContent value="marketing" className="mt-6">
            <EmailMarketingIntegration />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}