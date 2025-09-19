import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Send, UserPlus, TrendingUp, Calendar, Settings } from "lucide-react";

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  status: 'draft' | 'scheduled' | 'sent';
  recipientCount: number;
  openRate?: number;
  clickRate?: number;
  scheduledFor?: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'welcome' | 'nurture' | 'promotional' | 'newsletter';
}

export function EmailMarketingIntegration() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([
    {
      id: '1',
      name: 'Welcome Series',
      subject: 'Welcome to Business Bridge!',
      content: 'Thank you for joining Business Bridge...',
      status: 'sent',
      recipientCount: 156,
      openRate: 42.3,
      clickRate: 12.8
    },
    {
      id: '2',
      name: 'UK Market Insights',
      subject: 'Your Weekly UK Market Update',
      content: 'Here are the latest insights...',
      status: 'scheduled',
      recipientCount: 892,
      scheduledFor: '2024-03-20T09:00:00Z'
    }
  ]);

  const [templates] = useState<EmailTemplate[]>([
    {
      id: '1',
      name: 'Welcome Email',
      subject: 'Welcome to Business Bridge - Your UK Market Journey Begins!',
      content: `
        <h2>Welcome to Business Bridge!</h2>
        <p>Thank you for joining our community of Turkish businesses expanding to the UK market.</p>
        <p>Here's what you can expect:</p>
        <ul>
          <li>AI-powered business analysis</li>
          <li>Verified partner connections</li>
          <li>Market insights and trends</li>
        </ul>
        <a href="{dashboard_url}" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Get Started</a>
      `,
      type: 'welcome'
    },
    {
      id: '2',
      name: 'Partner Recommendation',
      subject: 'Perfect Partners Found for Your Business',
      content: `
        <h2>We found great partners for you!</h2>
        <p>Based on your business analysis, we've identified {partner_count} verified partners that could help your UK expansion.</p>
        <p>These partners specialize in:</p>
        <ul>
          <li>{specialty_1}</li>
          <li>{specialty_2}</li>
          <li>{specialty_3}</li>
        </ul>
        <a href="{partners_url}" style="background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Partners</a>
      `,
      type: 'nurture'
    }
  ]);

  const [newCampaign, setNewCampaign] = useState({
    name: '',
    subject: '',
    content: '',
    scheduleNow: true,
    scheduledFor: ''
  });

  const [automationSettings, setAutomationSettings] = useState({
    welcomeEmailEnabled: true,
    partnerRecommendationEnabled: true,
    weeklyDigestEnabled: false,
    abandonedAnalysisReminder: true
  });

  const { toast } = useToast();

  const handleCreateCampaign = async () => {
    try {
      // In a real implementation, this would integrate with an email service
      const campaign: EmailCampaign = {
        id: Date.now().toString(),
        name: newCampaign.name,
        subject: newCampaign.subject,
        content: newCampaign.content,
        status: newCampaign.scheduleNow ? 'sent' : 'scheduled',
        recipientCount: Math.floor(Math.random() * 1000) + 100,
        scheduledFor: newCampaign.scheduleNow ? undefined : newCampaign.scheduledFor
      };

      setCampaigns(prev => [...prev, campaign]);
      
      // Reset form
      setNewCampaign({
        name: '',
        subject: '',
        content: '',
        scheduleNow: true,
        scheduledFor: ''
      });

      toast({
        title: "Campaign Created",
        description: `${campaign.name} has been ${newCampaign.scheduleNow ? 'sent' : 'scheduled'} successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create campaign",
        variant: "destructive"
      });
    }
  };

  const sendWelcomeEmail = async (userEmail: string, userName: string) => {
    try {
      await supabase.functions.invoke('send-welcome-email', {
        body: {
          email: userEmail,
          name: userName,
          template: templates.find(t => t.type === 'welcome')
        }
      });
      
      toast({
        title: "Welcome Email Sent",
        description: `Welcome email sent to ${userEmail}`,
      });
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="default">Sent</Badge>;
      case 'scheduled':
        return <Badge variant="secondary">Scheduled</Badge>;
      default:
        return <Badge variant="outline">Draft</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Email Marketing Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,156</div>
            <p className="text-xs text-muted-foreground">
              <Badge variant="secondary" className="text-xs gap-1">
                <TrendingUp className="h-3 w-3" />
                +12% this month
              </Badge>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">38.4%</div>
            <p className="text-xs text-muted-foreground">Above industry average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.9%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campaigns Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Create New Campaign */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Create Email Campaign
          </CardTitle>
          <CardDescription>
            Send targeted emails to your subscribers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="campaign-name">Campaign Name</Label>
              <Input
                id="campaign-name"
                value={newCampaign.name}
                onChange={(e) => setNewCampaign(prev => ({...prev, name: e.target.value}))}
                placeholder="e.g., Monthly Newsletter"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaign-subject">Email Subject</Label>
              <Input
                id="campaign-subject"
                value={newCampaign.subject}
                onChange={(e) => setNewCampaign(prev => ({...prev, subject: e.target.value}))}
                placeholder="e.g., Your UK Market Update"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="campaign-content">Email Content</Label>
            <Textarea
              id="campaign-content"
              value={newCampaign.content}
              onChange={(e) => setNewCampaign(prev => ({...prev, content: e.target.value}))}
              placeholder="Write your email content here..."
              rows={6}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="schedule-now"
                checked={newCampaign.scheduleNow}
                onCheckedChange={(checked) => setNewCampaign(prev => ({...prev, scheduleNow: checked}))}
              />
              <Label htmlFor="schedule-now">Send immediately</Label>
            </div>
            
            {!newCampaign.scheduleNow && (
              <div className="flex items-center gap-2">
                <Label htmlFor="schedule-date">Schedule for:</Label>
                <Input
                  id="schedule-date"
                  type="datetime-local"
                  value={newCampaign.scheduledFor}
                  onChange={(e) => setNewCampaign(prev => ({...prev, scheduledFor: e.target.value}))}
                  className="w-48"
                />
              </div>
            )}
          </div>

          <Button onClick={handleCreateCampaign} className="w-full gap-2">
            <Send className="h-4 w-4" />
            {newCampaign.scheduleNow ? 'Send Campaign' : 'Schedule Campaign'}
          </Button>
        </CardContent>
      </Card>

      {/* Automation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Email Automation
          </CardTitle>
          <CardDescription>
            Configure automated email sequences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: 'welcomeEmailEnabled', label: 'Welcome Email Series', description: 'Send welcome emails to new users' },
            { key: 'partnerRecommendationEnabled', label: 'Partner Recommendations', description: 'Automatically send partner matches' },
            { key: 'weeklyDigestEnabled', label: 'Weekly Market Digest', description: 'Send weekly UK market insights' },
            { key: 'abandonedAnalysisReminder', label: 'Abandoned Analysis Reminder', description: 'Remind users to complete their analysis' }
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">{setting.label}</div>
                <div className="text-sm text-muted-foreground">{setting.description}</div>
              </div>
              <Switch
                checked={automationSettings[setting.key as keyof typeof automationSettings]}
                onCheckedChange={(checked) => 
                  setAutomationSettings(prev => ({...prev, [setting.key]: checked}))
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Campaigns</CardTitle>
          <CardDescription>
            Overview of your latest email campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="font-medium">{campaign.name}</div>
                    {getStatusBadge(campaign.status)}
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Subject: {campaign.subject}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{campaign.recipientCount} recipients</span>
                    {campaign.openRate && <span>{campaign.openRate}% open rate</span>}
                    {campaign.clickRate && <span>{campaign.clickRate}% click rate</span>}
                    {campaign.scheduledFor && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(campaign.scheduledFor).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                  {campaign.status === 'draft' && (
                    <Button size="sm">
                      Send
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Email Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Email Templates</CardTitle>
          <CardDescription>
            Pre-built templates for different email types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <div key={template.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{template.name}</div>
                  <Badge variant="outline">{template.type}</Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-3">
                  Subject: {template.subject}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Preview
                  </Button>
                  <Button size="sm">
                    Use Template
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}