/**
 * Analytics tracking utilities for conversion funnel and A/B testing
 * Tracks user interactions and funnel progression
 */

export type AnalyticsEventType = 
  | 'page_view'
  | 'analysis_started'
  | 'analysis_completed'
  | 'upgrade_viewed'
  | 'upgrade_clicked'
  | 'email_captured'
  | 'pricing_viewed';

interface AnalyticsEvent {
  event: AnalyticsEventType;
  timestamp: number;
  userId?: string;
  sessionId: string;
  properties?: Record<string, any>;
}

class Analytics {
  private sessionId: string;
  private events: AnalyticsEvent[] = [];

  constructor() {
    // Generate or retrieve session ID
    this.sessionId = this.getOrCreateSessionId();
  }

  private getOrCreateSessionId(): string {
    const existingId = sessionStorage.getItem('analytics_session_id');
    if (existingId) return existingId;

    const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', newId);
    return newId;
  }

  /**
   * Track an analytics event
   */
  track(event: AnalyticsEventType, properties?: Record<string, any>) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      properties,
    };

    this.events.push(analyticsEvent);
    
    // Store in localStorage for persistence
    this.persistEvents();

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log('[Analytics]', event, properties);
    }

    return analyticsEvent;
  }

  /**
   * Track conversion funnel progression
   */
  trackFunnel(step: 'landing' | 'form_start' | 'form_complete' | 'results_view' | 'upgrade_click', metadata?: Record<string, any>) {
    const funnelEvents = {
      landing: 'page_view',
      form_start: 'analysis_started',
      form_complete: 'analysis_completed',
      results_view: 'upgrade_viewed',
      upgrade_click: 'upgrade_clicked',
    } as const;

    return this.track(funnelEvents[step], {
      funnelStep: step,
      ...metadata,
    });
  }

  /**
   * Calculate conversion rates between funnel steps
   */
  getFunnelMetrics() {
    const events = this.getStoredEvents();
    
    const counts = {
      landing: events.filter(e => e.event === 'page_view').length,
      started: events.filter(e => e.event === 'analysis_started').length,
      completed: events.filter(e => e.event === 'analysis_completed').length,
      upgraded: events.filter(e => e.event === 'upgrade_clicked').length,
    };

    return {
      ...counts,
      startRate: counts.landing > 0 ? (counts.started / counts.landing * 100).toFixed(1) : '0',
      completionRate: counts.started > 0 ? (counts.completed / counts.started * 100).toFixed(1) : '0',
      upgradeRate: counts.completed > 0 ? (counts.upgraded / counts.completed * 100).toFixed(1) : '0',
    };
  }

  /**
   * Track time spent on page
   */
  trackTimeOnPage(pageName: string) {
    const startTime = Date.now();
    
    return () => {
      const duration = Date.now() - startTime;
      this.track('page_view', {
        page: pageName,
        duration,
        durationSeconds: Math.round(duration / 1000),
      });
    };
  }

  /**
   * Track scroll depth
   */
  trackScrollDepth(pageName: string) {
    let maxScroll = 0;
    
    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      maxScroll = Math.max(maxScroll, scrollPercent);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      this.track('page_view', {
        page: pageName,
        maxScrollDepth: maxScroll,
      });
    };
  }

  /**
   * A/B test variant assignment
   */
  assignVariant(testName: string, variants: string[]): string {
    const storageKey = `ab_test_${testName}`;
    const existing = localStorage.getItem(storageKey);
    
    if (existing && variants.includes(existing)) {
      return existing;
    }

    // Random assignment
    const variant = variants[Math.floor(Math.random() * variants.length)];
    localStorage.setItem(storageKey, variant);
    
    this.track('page_view', {
      abTest: testName,
      variant,
    });

    return variant;
  }

  /**
   * Get all stored events
   */
  private getStoredEvents(): AnalyticsEvent[] {
    try {
      const stored = localStorage.getItem('analytics_events');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Persist events to localStorage
   */
  private persistEvents() {
    try {
      const allEvents = [...this.getStoredEvents(), ...this.events];
      // Keep only last 100 events to avoid storage bloat
      const recentEvents = allEvents.slice(-100);
      localStorage.setItem('analytics_events', JSON.stringify(recentEvents));
      this.events = [];
    } catch (error) {
      console.error('Failed to persist analytics events:', error);
    }
  }

  /**
   * Clear all analytics data (for testing)
   */
  clear() {
    localStorage.removeItem('analytics_events');
    sessionStorage.removeItem('analytics_session_id');
    this.events = [];
  }
}

// Export singleton instance
export const analytics = new Analytics();

// Export convenience functions
export const trackEvent = (event: AnalyticsEventType, properties?: Record<string, any>) => 
  analytics.track(event, properties);

export const trackFunnel = (step: Parameters<typeof analytics.trackFunnel>[0], metadata?: Record<string, any>) =>
  analytics.trackFunnel(step, metadata);

export const trackTimeOnPage = (pageName: string) => analytics.trackTimeOnPage(pageName);

export const trackScrollDepth = (pageName: string) => analytics.trackScrollDepth(pageName);

export const assignVariant = (testName: string, variants: string[]) => 
  analytics.assignVariant(testName, variants);

export const getFunnelMetrics = () => analytics.getFunnelMetrics();
