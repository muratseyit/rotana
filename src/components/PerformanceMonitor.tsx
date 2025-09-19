import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Zap, Clock, Wifi, AlertTriangle, CheckCircle, Activity } from "lucide-react";

interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  connectionType: string;
  isOnline: boolean;
  memoryUsage?: number;
}

interface ComponentPerformance {
  component: string;
  renderTime: number;
  reRenders: number;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [componentMetrics, setComponentMetrics] = useState<ComponentPerformance[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  const calculatePerformanceScore = useCallback((metrics: PerformanceMetrics): number => {
    let score = 100;
    
    // Deduct points based on Core Web Vitals
    if (metrics.largestContentfulPaint > 2500) score -= 20;
    else if (metrics.largestContentfulPaint > 4000) score -= 40;
    
    if (metrics.firstInputDelay > 100) score -= 15;
    else if (metrics.firstInputDelay > 300) score -= 30;
    
    if (metrics.cumulativeLayoutShift > 0.1) score -= 15;
    else if (metrics.cumulativeLayoutShift > 0.25) score -= 30;
    
    if (metrics.firstContentfulPaint > 1800) score -= 10;
    else if (metrics.firstContentfulPaint > 3000) score -= 20;
    
    return Math.max(0, score);
  }, []);

  const generateWarnings = useCallback((metrics: PerformanceMetrics): string[] => {
    const warnings: string[] = [];
    
    if (metrics.largestContentfulPaint > 2500) {
      warnings.push("Large Contentful Paint is slow - consider optimizing images and above-the-fold content");
    }
    
    if (metrics.firstInputDelay > 100) {
      warnings.push("First Input Delay is high - consider reducing JavaScript execution time");
    }
    
    if (metrics.cumulativeLayoutShift > 0.1) {
      warnings.push("Cumulative Layout Shift detected - ensure proper image dimensions and avoid dynamic content insertion");
    }
    
    if (metrics.memoryUsage && metrics.memoryUsage > 50) {
      warnings.push("High memory usage detected - check for memory leaks");
    }
    
    return warnings;
  }, []);

  useEffect(() => {
    const collectMetrics = () => {
      // Get Core Web Vitals and performance metrics
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        const metrics: PerformanceMetrics = {
          loadTime: navigation.loadEventEnd - navigation.fetchStart,
          firstContentfulPaint: 0,
          largestContentfulPaint: 0,
          cumulativeLayoutShift: 0,
          firstInputDelay: 0,
          connectionType: (navigator as any).connection?.effectiveType || 'unknown',
          isOnline: navigator.onLine,
          memoryUsage: (performance as any).memory ? 
            Math.round(((performance as any).memory.usedJSHeapSize / (performance as any).memory.totalJSHeapSize) * 100) : undefined
        };

        // Get paint metrics
        const paintEntries = performance.getEntriesByType('paint');
        paintEntries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            metrics.firstContentfulPaint = entry.startTime;
          }
        });

        // Simulate LCP, CLS, and FID (in a real app, you'd use web-vitals library)
        metrics.largestContentfulPaint = Math.random() * 3000 + 1000;
        metrics.cumulativeLayoutShift = Math.random() * 0.3;
        metrics.firstInputDelay = Math.random() * 200;

        setMetrics(metrics);
        setWarnings(generateWarnings(metrics));
      }
    };

    // Collect metrics after a short delay to ensure page is loaded
    const timer = setTimeout(collectMetrics, 1000);

    // Mock component performance data
    setComponentMetrics([
      { component: 'BusinessForm', renderTime: 15.2, reRenders: 3 },
      { component: 'AnalysisResults', renderTime: 22.8, reRenders: 1 },
      { component: 'PartnerCard', renderTime: 8.5, reRenders: 2 },
      { component: 'Dashboard', renderTime: 45.1, reRenders: 4 },
    ]);

    return () => clearTimeout(timer);
  }, [generateWarnings]);

  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Monitor
          </CardTitle>
          <CardDescription>Loading performance metrics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const performanceScore = calculatePerformanceScore(metrics);
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score >= 90) return 'default';
    if (score >= 70) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Performance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Performance Score
          </CardTitle>
          <CardDescription>Overall application performance assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`text-3xl font-bold ${getScoreColor(performanceScore)}`}>
                {performanceScore}
              </div>
              <Badge variant={getScoreBadgeVariant(performanceScore)}>
                {performanceScore >= 90 ? 'Excellent' : performanceScore >= 70 ? 'Good' : 'Needs Improvement'}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wifi className="h-4 w-4" />
              {metrics.connectionType} | {metrics.isOnline ? 'Online' : 'Offline'}
            </div>
          </div>
          <Progress value={performanceScore} className="w-full" />
        </CardContent>
      </Card>

      {/* Core Web Vitals */}
      <Card>
        <CardHeader>
          <CardTitle>Core Web Vitals</CardTitle>
          <CardDescription>Key metrics that impact user experience</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">LCP</span>
              </div>
              <div className="text-2xl font-bold">
                {(metrics.largestContentfulPaint / 1000).toFixed(1)}s
              </div>
              <p className="text-xs text-muted-foreground">Largest Contentful Paint</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">FID</span>
              </div>
              <div className="text-2xl font-bold">
                {metrics.firstInputDelay.toFixed(0)}ms
              </div>
              <p className="text-xs text-muted-foreground">First Input Delay</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">CLS</span>
              </div>
              <div className="text-2xl font-bold">
                {metrics.cumulativeLayoutShift.toFixed(3)}
              </div>
              <p className="text-xs text-muted-foreground">Cumulative Layout Shift</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">FCP</span>
              </div>
              <div className="text-2xl font-bold">
                {(metrics.firstContentfulPaint / 1000).toFixed(1)}s
              </div>
              <p className="text-xs text-muted-foreground">First Contentful Paint</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Component Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Component Performance</CardTitle>
          <CardDescription>Render times and re-render counts for key components</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {componentMetrics.map((component, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{component.component}</div>
                  <div className="text-sm text-muted-foreground">
                    {component.reRenders} re-renders
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{component.renderTime}ms</div>
                  <div className="text-sm text-muted-foreground">render time</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Warnings */}
      {warnings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Performance Recommendations
            </CardTitle>
            <CardDescription>Issues that may impact user experience</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {warnings.map((warning, index) => (
                <Alert key={index}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{warning}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Memory Usage */}
      {metrics.memoryUsage && (
        <Card>
          <CardHeader>
            <CardTitle>Memory Usage</CardTitle>
            <CardDescription>JavaScript heap memory consumption</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Memory Usage</span>
              <span className="text-sm text-muted-foreground">{metrics.memoryUsage}%</span>
            </div>
            <Progress value={metrics.memoryUsage} className="w-full" />
            {metrics.memoryUsage > 70 && (
              <Alert className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  High memory usage detected. Consider optimizing data structures and checking for memory leaks.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}