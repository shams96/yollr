import { useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  AnalyticsEvent,
  AuthEvent,
  EngagementEvent,
  ContentEvent,
  SocialEvent,
  GamificationEvent,
  NavigationEvent,
  PerformanceEvent,
  ErrorEvent,
  AnalyticsQuery
} from '@/types/analytics';
import { analyticsService } from '@/lib/analytics/analytics-service';

export interface UseAnalyticsReturn {
  // Event tracking methods
  trackEvent: (event: Omit<AnalyticsEvent, 'timestamp' | 'userId' | 'campusId' | 'sessionId'>) => void;
  trackAuthEvent: (event: Omit<AuthEvent, 'timestamp' | 'userId' | 'campusId' | 'sessionId'>) => void;
  trackEngagementEvent: (event: Omit<EngagementEvent, 'timestamp' | 'userId' | 'campusId' | 'sessionId'>) => void;
  trackContentEvent: (event: Omit<ContentEvent, 'timestamp' | 'userId' | 'campusId' | 'sessionId'>) => void;
  trackSocialEvent: (event: Omit<SocialEvent, 'timestamp' | 'userId' | 'campusId' | 'sessionId'>) => void;
  trackGamificationEvent: (event: Omit<GamificationEvent, 'timestamp' | 'userId' | 'campusId' | 'sessionId'>) => void;
  trackNavigationEvent: (event: Omit<NavigationEvent, 'timestamp' | 'userId' | 'campusId' | 'sessionId'>) => void;
  trackPerformanceEvent: (event: Omit<PerformanceEvent, 'timestamp' | 'userId' | 'campusId' | 'sessionId'>) => void;
  trackErrorEvent: (event: Omit<ErrorEvent, 'timestamp' | 'userId' | 'campusId' | 'sessionId'>) => void;
  
  // Convenience tracking methods
  trackPageView: (page: string, properties?: Record<string, unknown>) => void;
  trackFeatureUsage: (featureName: string, properties?: Record<string, unknown>) => void;
  trackUserAction: (action: string, properties?: Record<string, unknown>) => void;
  trackContentInteraction: (contentType: string, contentId: string, interaction: string, properties?: Record<string, unknown>) => void;
  
  // User management
  setAnalyticsUser: (userId: string, campusId?: string) => void;
  clearAnalyticsUser: () => void;
  
  // Analytics queries
  getAnalyticsReport: (query: AnalyticsQuery) => Promise<any>;
  
  // Performance tracking
  startTimer: (name: string) => void;
  endTimer: (name: string) => void;
}

export function useAnalytics(): UseAnalyticsReturn {
  const { user } = useAuth();
  const timersRef = useRef<Map<string, number>>(new Map());

  // Set analytics user when auth changes
  useEffect(() => {
    if (user?.id) {
      analyticsService.setUser(user.id, user.user_metadata?.campus_id);
    } else {
      analyticsService.clearUser();
    }
  }, [user]);

  // Track page views on route changes
  useEffect(() => {
    const trackPageView = () => {
      analyticsService.trackNavigationEvent({
        category: 'navigation',
        eventName: 'page_view',
        properties: {
          page: window.location.pathname,
          url: window.location.href,
        },
      });
    };

    // Track initial page view
    trackPageView();

    // Track subsequent page views (for SPA navigation)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(this, args);
      trackPageView();
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      trackPageView();
    };

    window.addEventListener('popstate', trackPageView);

    return () => {
      window.removeEventListener('popstate', trackPageView);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  const trackEvent = useCallback((event: Omit<AnalyticsEvent, 'timestamp' | 'userId' | 'campusId' | 'sessionId'>) => {
    analyticsService.trackEvent(event);
  }, []);

  const trackAuthEvent = useCallback((event: Omit<AuthEvent, 'timestamp' | 'userId' | 'campusId' | 'sessionId'>) => {
    analyticsService.trackAuthEvent(event);
  }, []);

  const trackEngagementEvent = useCallback((event: Omit<EngagementEvent, 'timestamp' | 'userId' | 'campusId' | 'sessionId'>) => {
    analyticsService.trackEngagementEvent(event);
  }, []);

  const trackContentEvent = useCallback((event: Omit<ContentEvent, 'timestamp' | 'userId' | 'campusId' | 'sessionId'>) => {
    analyticsService.trackContentEvent(event);
  }, []);

  const trackSocialEvent = useCallback((event: Omit<SocialEvent, 'timestamp' | 'userId' | 'campusId' | 'sessionId'>) => {
    analyticsService.trackSocialEvent(event);
  }, []);

  const trackGamificationEvent = useCallback((event: Omit<GamificationEvent, 'timestamp' | 'userId' | 'campusId' | 'sessionId'>) => {
    analyticsService.trackGamificationEvent(event);
  }, []);

  const trackNavigationEvent = useCallback((event: Omit<NavigationEvent, 'timestamp' | 'userId' | 'campusId' | 'sessionId'>) => {
    analyticsService.trackNavigationEvent(event);
  }, []);

  const trackPerformanceEvent = useCallback((event: Omit<PerformanceEvent, 'timestamp' | 'userId' | 'campusId' | 'sessionId'>) => {
    analyticsService.trackPerformanceEvent(event);
  }, []);

  const trackErrorEvent = useCallback((event: Omit<ErrorEvent, 'timestamp' | 'userId' | 'campusId' | 'sessionId'>) => {
    analyticsService.trackErrorEvent(event);
  }, []);

  // Convenience methods
  const trackPageView = useCallback((page: string, properties?: Record<string, unknown>) => {
    analyticsService.trackNavigationEvent({
      category: 'navigation',
      eventName: 'page_view',
      properties: {
        page,
        ...properties,
      },
    });
  }, []);

  const trackFeatureUsage = useCallback((featureName: string, properties?: Record<string, unknown>) => {
    analyticsService.trackEvent({
      category: 'engagement',
      eventName: 'moment_viewed', // Using existing event type
      properties: {
        contentType: 'moment' as const,
        contentId: featureName,
        ...properties,
      } as any,
    } as any);
  }, []);

  const trackUserAction = useCallback((action: string, properties?: Record<string, unknown>) => {
    analyticsService.trackEvent({
      category: 'engagement',
      eventName: 'moment_viewed', // Using existing event type
      properties: {
        contentType: 'moment' as const,
        contentId: action,
        ...properties,
      } as any,
    } as any);
  }, []);

  const trackContentInteraction = useCallback((
    contentType: string,
    contentId: string,
    interaction: string,
    properties?: Record<string, unknown>
  ) => {
    analyticsService.trackEngagementEvent({
      category: 'engagement',
      eventName: 'moment_viewed', // Using existing event type
      properties: {
        contentType: contentType as any,
        contentId,
        engagementType: interaction as any,
        ...properties,
      } as any,
    } as any);
  }, []);

  // User management
  const setAnalyticsUser = useCallback((userId: string, campusId?: string) => {
    analyticsService.setUser(userId, campusId);
  }, []);

  const clearAnalyticsUser = useCallback(() => {
    analyticsService.clearUser();
  }, []);

  // Analytics queries
  const getAnalyticsReport = useCallback(async (query: AnalyticsQuery) => {
    try {
      const response = await fetch('/api/analytics/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics report');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching analytics report:', error);
      throw error;
    }
  }, []);

  // Performance tracking
  const startTimer = useCallback((name: string) => {
    timersRef.current.set(name, Date.now());
  }, []);

  const endTimer = useCallback((name: string) => {
    const startTime = timersRef.current.get(name);
    if (startTime) {
      const duration = Date.now() - startTime;
      analyticsService.trackPerformanceEvent({
        category: 'performance',
        eventName: 'render_time', // Using existing event type
        properties: {
          duration,
          component: name,
        } as any,
      } as any);
      timersRef.current.delete(name);
    }
  }, []);

  return {
    trackEvent,
    trackAuthEvent,
    trackEngagementEvent,
    trackContentEvent,
    trackSocialEvent,
    trackGamificationEvent,
    trackNavigationEvent,
    trackPerformanceEvent,
    trackErrorEvent,
    trackPageView,
    trackFeatureUsage,
    trackUserAction,
    trackContentInteraction,
    setAnalyticsUser,
    clearAnalyticsUser,
    getAnalyticsReport,
    startTimer,
    endTimer,
  };
}

// Hook for tracking component-specific analytics
export function useComponentAnalytics(componentName: string) {
  const { trackEvent, startTimer, endTimer } = useAnalytics();

  useEffect(() => {
    // Track component mount
    trackEvent({
      category: 'engagement',
      eventName: 'moment_viewed',
      properties: {
        contentType: 'moment' as const,
        contentId: componentName,
      } as any,
    } as any);

    // Track component load time
    const loadTimer = `${componentName}_load`;
    startTimer(loadTimer);

    // End timer after component is mounted and rendered
    const timer = setTimeout(() => {
      endTimer(loadTimer);
    }, 0);

    return () => {
      clearTimeout(timer);
      trackEvent({
        category: 'engagement',
        eventName: 'moment_viewed',
        properties: {
          contentType: 'moment' as const,
          contentId: `${componentName}_unmounted`,
        } as any,
      } as any);
    };
  }, [componentName, trackEvent, startTimer, endTimer]);

  const trackComponentInteraction = useCallback((interaction: string, properties?: Record<string, unknown>) => {
    trackEvent({
      category: 'engagement',
      eventName: 'moment_viewed',
      properties: {
        contentType: 'moment' as const,
        contentId: componentName,
        engagementType: interaction as any,
        ...properties,
      } as any,
    } as any);
  }, [componentName, trackEvent]);

  return {
    trackComponentInteraction,
  };
}

// Hook for tracking feature-specific analytics
export function useFeatureAnalytics(featureName: string) {
  const { trackFeatureUsage, startTimer, endTimer } = useAnalytics();

  useEffect(() => {
    trackFeatureUsage(featureName, { action: 'view' });
  }, [featureName, trackFeatureUsage]);

  const trackFeatureInteraction = useCallback((interaction: string, properties?: Record<string, unknown>) => {
    trackFeatureUsage(featureName, {
      action: interaction,
      ...properties,
    });
  }, [featureName, trackFeatureUsage]);

  const trackFeaturePerformance = useCallback((operation: string, duration: number, properties?: Record<string, unknown>) => {
    trackFeatureUsage(featureName, {
      action: 'performance',
      operation,
      duration,
      ...properties,
    });
  }, [featureName, trackFeatureUsage]);

  return {
    trackFeatureInteraction,
    trackFeaturePerformance,
    startTimer,
    endTimer,
  };
}