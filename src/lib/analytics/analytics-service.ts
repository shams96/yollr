/**
 * Analytics Service for Yollr Campus Engagement Platform
 * Provides comprehensive event tracking, batching, and reporting capabilities
 */

import {
  AnalyticsEvent,
  AnalyticsEventCategory,
  AuthEvent,
  EngagementEvent,
  ContentEvent,
  SocialEvent,
  GamificationEvent,
  NavigationEvent,
  PerformanceEvent,
  ErrorEvent,
  AnalyticsQuery,
  AnalyticsReport
} from '@/types/analytics';
import { errorMonitor, trackEvent as trackMonitoringEvent } from '@/lib/monitoring';
import { createClient } from '@/lib/supabase/client';

export interface AnalyticsConfig {
  enabled: boolean;
  environment: string;
  serviceName: string;
  version: string;
  batchSize: number;
  flushInterval: number;
  maxQueueSize: number;
  endpoint?: string;
}

interface AnalyticsQueueItem {
  event: AnalyticsEvent;
  retryCount: number;
  lastAttempt?: string;
}

class AnalyticsService {
  private config: AnalyticsConfig;
  private eventQueue: AnalyticsQueueItem[] = [];
  private sessionId: string;
  private userId?: string;
  private campusId?: string;
  private flushTimer?: NodeJS.Timeout;
  private isFlushing = false;
  private offlineEvents: AnalyticsEvent[] = [];
  private isOnline = true;

  constructor(config: AnalyticsConfig) {
    this.config = config;
    this.sessionId = this.generateSessionId();
    
    this.setupEventListeners();
    this.startFlushTimer();
    
    // Track app load
    this.trackAppLoad();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupEventListeners() {
    // Handle online/offline status
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.flushOfflineEvents();
      });
      
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });

      // Track page visibility
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.trackEvent({
            category: 'engagement',
            eventName: 'app_backgrounded',
            properties: {
              timeInApp: Date.now() - this.getSessionStartTime(),
            },
          });
        } else {
          this.trackEvent({
            category: 'engagement',
            eventName: 'app_foregrounded',
            properties: {},
          });
        }
      });

      // Track before unload
      window.addEventListener('beforeunload', () => {
        this.trackEvent({
          category: 'engagement',
          eventName: 'app_closed',
          properties: {
            timeInApp: Date.now() - this.getSessionStartTime(),
            eventsTracked: this.eventQueue.length,
          },
        });
        
        // Flush any remaining events
        this.flushEvents();
      });
    }
  }

  private startFlushTimer() {
    if (this.config.enabled && this.config.flushInterval > 0) {
      this.flushTimer = setInterval(() => {
        this.flushEvents();
      }, this.config.flushInterval);
    }
  }

  private getSessionStartTime(): number {
    const sessionStart = sessionStorage.getItem('analytics_session_start');
    return sessionStart ? parseInt(sessionStart) : Date.now();
  }

  private trackAppLoad() {
    const loadTime = performance?.timing ? 
      performance.timing.loadEventEnd - performance.timing.navigationStart : 
      0;

    this.trackEvent({
      category: 'performance',
      eventName: 'app_load_time',
      properties: {
        duration: loadTime,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        viewport: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '',
      },
    });
  }

  public setUser(userId: string, campusId?: string) {
    this.userId = userId;
    this.campusId = campusId;
    
    this.trackEvent({
      category: 'authentication',
      eventName: 'user_identified',
      properties: {
        userId,
        campusId,
      },
    });
  }

  public clearUser() {
    this.userId = undefined;
    this.campusId = undefined;
    this.sessionId = uuidv4(); // Start new session
  }

  public trackEvent(event: Omit<AnalyticsEvent, 'timestamp' | 'userId' | 'campusId' | 'sessionId'>): void {
    if (!this.config.enabled) return;

    const fullEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      userId: this.userId,
      campusId: this.campusId,
      sessionId: this.sessionId,
    } as AnalyticsEvent;

    // Add to queue
    this.eventQueue.push({
      event: fullEvent,
      retryCount: 0,
    });

    // Also track in monitoring system
    trackMonitoringEvent(event.eventName, event.properties);

    // Check if we should flush immediately
    if (this.eventQueue.length >= this.config.batchSize) {
      this.flushEvents();
    }

    // Store offline if not online
    if (!this.isOnline) {
      this.offlineEvents.push(fullEvent);
    }
  }

  // Convenience methods for specific event types
  public trackAuthEvent(event: Omit<AuthEvent, 'timestamp' | 'userId' | 'campusId' | 'sessionId'>): void {
    this.trackEvent(event);
  }

  public trackEngagementEvent(event: Omit<EngagementEvent, 'timestamp' | 'userId' | 'campusId' | 'sessionId'>): void {
    this.trackEvent(event);
  }

  public trackContentEvent(event: Omit<ContentEvent, 'timestamp' | 'userId' | 'campusId' | 'sessionId'>): void {
    this.trackEvent(event);
  }

  public trackSocialEvent(event: Omit<SocialEvent, 'timestamp' | 'userId' | 'campusId' | 'sessionId'>): void {
    this.trackEvent(event);
  }

  public trackGamificationEvent(event: Omit<GamificationEvent, 'timestamp' | 'userId' | 'campusId' | 'sessionId'>): void {
    this.trackEvent(event);
  }

  public trackNavigationEvent(event: Omit<NavigationEvent, 'timestamp' | 'userId' | 'campusId' | 'sessionId'>): void {
    this.trackEvent(event);
  }

  public trackPerformanceEvent(event: Omit<PerformanceEvent, 'timestamp' | 'userId' | 'campusId' | 'sessionId'>): void {
    this.trackEvent(event);
  }

  public trackErrorEvent(event: Omit<ErrorEvent, 'timestamp' | 'userId' | 'campusId' | 'sessionId'>): void {
    // Also capture in error monitor
    errorMonitor.captureError(
      new Error(event.properties.errorMessage),
      {
        ...event.properties,
        category: event.category,
        eventName: event.eventName,
      }
    );
    
    this.trackEvent(event);
  }

  private async flushEvents(): Promise<void> {
    if (this.isFlushing || this.eventQueue.length === 0) return;

    this.isFlushing = true;
    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // In a real implementation, this would send to your analytics service
      // For now, we'll log to console and store in Supabase if configured
      
      console.log(`[Analytics] Flushing ${eventsToSend.length} events`);
      
      // Store in Supabase analytics table if available
      const supabase = createClient();
      const eventsData = eventsToSend.map(item => ({
        event_name: item.event.eventName,
        category: item.event.category,
        user_id: item.event.userId,
        campus_id: item.event.campusId,
        session_id: item.event.sessionId,
        properties: item.event.properties,
        timestamp: item.event.timestamp,
      }));
      
      const { error } = await supabase
        .from('analytics_events')
        .insert(eventsData as any);

      if (error) {
        console.error('Failed to store analytics events:', error);
        // Put events back in queue to retry
        this.eventQueue.unshift(...eventsToSend);
      } else {
        console.log(`[Analytics] Successfully stored ${eventsToSend.length} events`);
      }

    } catch (error) {
      console.error('Failed to flush analytics events:', error);
      // Put events back in queue to retry
      this.eventQueue.unshift(...eventsToSend);
    } finally {
      this.isFlushing = false;
    }
  }

  private async flushOfflineEvents(): Promise<void> {
    if (this.offlineEvents.length === 0) return;

    console.log(`[Analytics] Flushing ${this.offlineEvents.length} offline events`);
    
    for (const event of this.offlineEvents) {
      this.eventQueue.push({
        event,
        retryCount: 0,
      });
    }
    
    this.offlineEvents = [];
    this.flushEvents();
  }

  public async getAnalytics(query: AnalyticsQuery): Promise<AnalyticsReport> {
    const supabase = createClient();
    
    let dbQuery = supabase
      .from('analytics_events')
      .select('*');

    if (query.startDate) {
      dbQuery = dbQuery.gte('timestamp', query.startDate);
    }
    
    if (query.endDate) {
      dbQuery = dbQuery.lte('timestamp', query.endDate);
    }
    
    if (query.campusId) {
      dbQuery = dbQuery.eq('campus_id', query.campusId);
    }
    
    if (query.userId) {
      dbQuery = dbQuery.eq('user_id', query.userId);
    }
    
    if (query.eventCategory) {
      dbQuery = dbQuery.eq('category', query.eventCategory);
    }
    
    if (query.eventName) {
      dbQuery = dbQuery.eq('event_name', query.eventName);
    }

    const { data, error } = await dbQuery
      .order('timestamp', { ascending: false })
      .limit(10000);

    if (error) {
      throw new Error(`Failed to fetch analytics: ${error.message}`);
    }

    return this.generateReport(data || [], query);
  }

  private generateReport(events: any[], query: AnalyticsQuery): AnalyticsReport {
    const totalEvents = events.length;
    const uniqueUsers = new Set(events.map(e => e.user_id)).size;
    const uniqueSessions = new Set(events.map(e => e.session_id)).size;

    // Group by category
    const byCategory = events.reduce((acc, event) => {
      acc[event.category] = (acc[event.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by campus
    const byCampus = events.reduce((acc, event) => {
      if (event.campus_id) {
        acc[event.campus_id] = (acc[event.campus_id] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Generate trends based on groupBy parameter
    const trends = this.generateTrends(events, query.groupBy || 'day');

    return {
      summary: {
        totalEvents,
        totalUsers: uniqueUsers,
        totalSessions: uniqueSessions,
        avgEngagementRate: this.calculateEngagementRate(events),
      },
      trends,
      breakdowns: {
        byCategory: byCategory as Record<AnalyticsEventCategory, number>,
        byCampus,
        byFeature: {}, // Would need to parse event names to determine features
      },
      insights: this.generateInsights(events),
      generatedAt: new Date().toISOString(),
    };
  }

  private generateTrends(events: any[], groupBy: string): Array<{ timestamp: string; metrics: Record<string, number> }> {
    const grouped = events.reduce((acc, event) => {
      const date = new Date(event.timestamp);
      let key: string;

      switch (groupBy) {
        case 'hour':
          key = date.toISOString().slice(0, 13) + ':00:00';
          break;
        case 'day':
          key = date.toISOString().slice(0, 10);
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().slice(0, 10);
          break;
        case 'month':
          key = date.toISOString().slice(0, 7) + '-01';
          break;
        default:
          key = date.toISOString().slice(0, 10);
      }

      if (!acc[key]) {
        acc[key] = { events: 0, users: new Set(), sessions: new Set() };
      }

      acc[key].events++;
      acc[key].users.add(event.user_id);
      acc[key].sessions.add(event.session_id);

      return acc;
    }, {} as Record<string, { events: number; users: Set<string>; sessions: Set<string> }>);

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([timestamp, data]) => ({
        timestamp,
        metrics: {
          events: (data as any).events,
          users: (data as any).users.size,
          sessions: (data as any).sessions.size,
        },
      }));
  }

  private calculateEngagementRate(events: any[]): number {
    const engagementEvents = events.filter(e => 
      ['engagement', 'social', 'gamification'].includes(e.category)
    );
    return events.length > 0 ? (engagementEvents.length / events.length) * 100 : 0;
  }

  private generateInsights(events: any[]): string[] {
    const insights: string[] = [];
    
    // Basic insights based on event patterns
    const categoryCounts = events.reduce((acc, event) => {
      acc[event.category] = (acc[event.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(categoryCounts)
      .sort(([,a]: [string, any], [,b]: [string, any]) => b - a)[0];

    if (topCategory) {
      insights.push(`Most active category: ${topCategory[0]} (${topCategory[1]} events)`);
    }

    const errorCount = events.filter(e => e.category === 'error').length;
    if (errorCount > 0) {
      insights.push(`Total errors: ${errorCount}`);
    }

    return insights;
  }

  public destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    // Flush any remaining events
    this.flushEvents();
  }
}

// Create singleton instance
const analyticsConfig: AnalyticsConfig = {
  enabled: process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true',
  environment: process.env.NODE_ENV || 'development',
  serviceName: 'yollr-app',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  batchSize: parseInt(process.env.NEXT_PUBLIC_ANALYTICS_BATCH_SIZE || '10'),
  flushInterval: parseInt(process.env.NEXT_PUBLIC_ANALYTICS_FLUSH_INTERVAL || '30000'),
  maxQueueSize: parseInt(process.env.NEXT_PUBLIC_ANALYTICS_MAX_QUEUE_SIZE || '100'),
  endpoint: process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT,
};

export const analyticsService = new AnalyticsService(analyticsConfig);

// Convenience functions
export const trackEvent = (event: Omit<AnalyticsEvent, 'timestamp' | 'userId' | 'campusId' | 'sessionId'>) => {
  analyticsService.trackEvent(event);
};

export const setAnalyticsUser = (userId: string, campusId?: string) => {
  analyticsService.setUser(userId, campusId);
};

export const clearAnalyticsUser = () => {
  analyticsService.clearUser();
};

export const getAnalyticsReport = (query: AnalyticsQuery) => {
  return analyticsService.getAnalytics(query);
};

// React hook convenience
export const useAnalytics = () => ({
  trackEvent: analyticsService.trackEvent.bind(analyticsService),
  trackAuthEvent: analyticsService.trackAuthEvent.bind(analyticsService),
  trackEngagementEvent: analyticsService.trackEngagementEvent.bind(analyticsService),
  trackContentEvent: analyticsService.trackContentEvent.bind(analyticsService),
  trackSocialEvent: analyticsService.trackSocialEvent.bind(analyticsService),
  trackGamificationEvent: analyticsService.trackGamificationEvent.bind(analyticsService),
  trackNavigationEvent: analyticsService.trackNavigationEvent.bind(analyticsService),
  trackPerformanceEvent: analyticsService.trackPerformanceEvent.bind(analyticsService),
  trackErrorEvent: analyticsService.trackErrorEvent.bind(analyticsService),
  setUser: analyticsService.setUser.bind(analyticsService),
  clearUser: analyticsService.clearUser.bind(analyticsService),
});