import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AdminAnalytics } from "@/components/AdminAnalytics";
import { AdminUserManagement } from "@/components/AdminUserManagement";
import AdminPartners from "@/pages/AdminPartners";
import { PerformanceMonitor } from "@/components/PerformanceMonitor";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
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
  Mail
} from "lucide-react";
import { EmailMarketingIntegration } from "@/components/EmailMarketingIntegration";

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Mock admin statistics
  const stats = {
    totalUsers: 1247,
    activeUsers: 892,
    totalPartners: 43,
    pendingPartners: 8,
    totalAnalyses: 2156,
    conversionRate: 12.5,
    systemHealth: 98.2
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Site
              </Button>
              <div className="flex items-center gap-3">
                <Settings className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                  <p className="text-sm text-muted-foreground">
                    Converta Management Console
                  </p>
                </div>
              </div>
            </div>
            <Badge variant="default" className="gap-2">
              <Activity className="h-3 w-3" />
              System Health: {stats.systemHealth}%
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="partners" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Partners</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Performance</span>
            </TabsTrigger>
            <TabsTrigger value="marketing" className="gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Marketing</span>
            </TabsTrigger>
          </TabsList>

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
                    <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% active rate
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
                    {[
                      { type: 'partner', message: 'New partner application from TechConsult UK', time: '2 minutes ago' },
                      { type: 'user', message: '15 new user registrations today', time: '1 hour ago' },
                      { type: 'analysis', message: '47 business analyses completed', time: '3 hours ago' },
                      { type: 'system', message: 'Weekly backup completed successfully', time: '6 hours ago' },
                      { type: 'partner', message: 'Partner verification completed for Legal Advisors Ltd', time: '1 day ago' },
                    ].map((activity, index) => (
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
                    ))}
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