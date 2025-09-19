import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  ArrowRight, 
  PlayCircle, 
  User, 
  FileText, 
  Users, 
  Settings 
} from "lucide-react";

export function TestUserJourney() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<string | null>(null);

  const userJourneys = [
    {
      id: 'guest-user',
      title: 'Guest User Journey',
      description: 'Test the complete guest analysis flow',
      icon: <User className="h-5 w-5" />,
      steps: [
        { name: 'Landing Page', path: '/', status: 'ready' },
        { name: 'Guest Analysis Form', path: '/guest-analysis', status: 'ready' },
        { name: 'Analysis Results', path: '/guest-results', status: 'needs-data' },
        { name: 'Subscription Gate', path: '/comprehensive-analysis', status: 'ready' }
      ]
    },
    {
      id: 'partner-directory',
      title: 'Partner Directory',
      description: 'Browse and interact with partners',
      icon: <Users className="h-5 w-5" />,
      steps: [
        { name: 'Partner Directory', path: '/partners', status: 'ready' },
        { name: 'Partner Application', path: '/partners', status: 'ready' },
        { name: 'Smart Filtering', path: '/partners', status: 'ready' }
      ]
    },
    {
      id: 'admin-panel',
      title: 'Admin Dashboard',
      description: 'Manage platform and partners',
      icon: <Settings className="h-5 w-5" />,
      steps: [
        { name: 'Admin Overview', path: '/admin', status: 'ready' },
        { name: 'Partner Management', path: '/admin', status: 'ready' },
        { name: 'Analytics Dashboard', path: '/admin', status: 'ready' },
        { name: 'User Management', path: '/admin', status: 'ready' }
      ]
    },
    {
      id: 'pricing-flow',
      title: 'Pricing & Features',
      description: 'View pricing and feature pages',
      icon: <FileText className="h-5 w-5" />,
      steps: [
        { name: 'Features Page', path: '/features', status: 'ready' },
        { name: 'Pricing Page', path: '/pricing', status: 'ready' }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800';
      case 'needs-data': return 'bg-yellow-100 text-yellow-800';
      case 'incomplete': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const startJourney = (journeyId: string) => {
    setCurrentStep(journeyId);
    const journey = userJourneys.find(j => j.id === journeyId);
    if (journey && journey.steps.length > 0) {
      navigate(journey.steps[0].path);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">MVP Test Dashboard</h1>
        <p className="text-muted-foreground">
          Test all critical user journeys and platform features
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {userJourneys.map((journey) => (
          <Card key={journey.id} className="relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                {journey.icon}
                {journey.title}
              </CardTitle>
              <CardDescription>{journey.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {journey.steps.map((step, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded border">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{step.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${getStatusColor(step.status)}`}>
                        {step.status.replace('-', ' ')}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(step.path)}
                        className="h-8 px-2"
                      >
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button 
                onClick={() => startJourney(journey.id)}
                className="w-full gap-2"
                variant={currentStep === journey.id ? "default" : "outline"}
              >
                <PlayCircle className="h-4 w-4" />
                Start Journey
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Test Actions</CardTitle>
          <CardDescription>
            Common actions for testing platform functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              onClick={() => {
                // Store test data for guest results
                const testData = {
                  companyName: "Test Company Ltd",
                  businessDescription: "A test company for UK market entry",
                  industry: "Technology & Software",
                  companySize: "11-50 employees",
                  websiteUrl: "https://testcompany.com",
                  email: "test@testcompany.com"
                };
                localStorage.setItem('guestAnalysisData', JSON.stringify(testData));
                navigate('/guest-results');
              }}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Test Results Page
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate('/partners')}
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              View Partners
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate('/admin')}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Admin Panel
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate('/guest-analysis')}
              className="gap-2"
            >
              <User className="h-4 w-4" />
              Start Analysis
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            MVP Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-green-600">✅ Core Features Ready</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Guest business analysis</li>
                <li>• Partner directory & filtering</li>
                <li>• Admin dashboard</li>
                <li>• Subscription gates</li>
                <li>• Email marketing system</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-blue-600">🔧 Technical Features</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Performance monitoring</li>
                <li>• Error boundaries</li>
                <li>• SEO optimization</li>
                <li>• Responsive design</li>
                <li>• Database integration</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-purple-600">🚀 Launch Ready</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Lead capture forms</li>
                <li>• Analytics tracking</li>
                <li>• Email automation</li>
                <li>• Partner onboarding</li>
                <li>• User management</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}