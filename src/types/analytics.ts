/**
 * Analytics event types for Yollr campus engagement platform
 */

export type AnalyticsEventCategory = 
  | 'authentication'
  | 'engagement'
  | 'content'
  | 'social'
  | 'gamification'
  | 'navigation'
  | 'performance'
  | 'error';

export interface BaseAnalyticsEvent {
  eventName: string;
  category: AnalyticsEventCategory;
  timestamp: string;
  userId?: string;
  campusId?: string;
  sessionId?: string;
  properties?: Record<string, unknown>;
}

// Authentication Events
export interface AuthEvent extends BaseAnalyticsEvent {
  category: 'authentication';
  eventName: 
    | 'login_started'
    | 'login_completed'
    | 'login_failed'
    | 'logout'
    | 'signup_started'
    | 'signup_completed'
    | 'otp_sent'
    | 'otp_verified'
    | 'otp_failed'
    | 'profile_updated';
  properties: {
    method?: 'phone' | 'email' | 'social';
    error?: string;
    verificationMethod?: 'sms' | 'email';
    step?: string;
  };
}

// Engagement Events
export interface EngagementEvent extends BaseAnalyticsEvent {
  category: 'engagement';
  eventName:
    | 'moment_created'
    | 'moment_viewed'
    | 'moment_shared'
    | 'poll_created'
    | 'poll_voted'
    | 'poll_shared'
    | 'heist_submission_created'
    | 'heist_voted'
    | 'heist_shared'
    | 'reaction_added'
    | 'comment_added'
    | 'content_reported';
  properties: {
    contentType: 'moment' | 'poll' | 'heist' | 'squad';
    contentId: string;
    engagementType?: 'view' | 'create' | 'vote' | 'react' | 'comment' | 'share' | 'report';
    reactionType?: string;
    timeSpent?: number;
    completionRate?: number;
  };
}

// Content Events
export interface ContentEvent extends BaseAnalyticsEvent {
  category: 'content';
  eventName:
    | 'feed_loaded'
    | 'feed_scrolled'
    | 'content_loaded'
    | 'content_error'
    | 'media_upload_started'
    | 'media_upload_completed'
    | 'media_upload_failed'
    | 'search_performed'
    | 'filter_applied';
  properties: {
    contentType?: 'moment' | 'poll' | 'heist' | 'squad' | 'athletics';
    loadTime?: number;
    itemsCount?: number;
    query?: string;
    filters?: Record<string, unknown>;
    error?: string;
    uploadSize?: number;
    uploadDuration?: number;
  };
}

// Social Events
export interface SocialEvent extends BaseAnalyticsEvent {
  category: 'social';
  eventName:
    | 'squad_joined'
    | 'squad_left'
    | 'squad_created'
    | 'campus_joined'
    | 'user_followed'
    | 'user_unfollowed'
    | 'profile_viewed'
    | 'leaderboard_viewed';
  properties: {
    squadId?: string;
    squadType?: string;
    campusId: string;
    targetUserId?: string;
    rank?: number;
    totalUsers?: number;
  };
}

// Gamification Events
export interface GamificationEvent extends BaseAnalyticsEvent {
  category: 'gamification';
  eventName:
    | 'xp_earned'
    | 'level_up'
    | 'streak_started'
    | 'streak_maintained'
    | 'streak_lost'
    | 'mystery_box_earned'
    | 'mystery_box_opened'
    | 'reward_claimed'
    | 'achievement_unlocked'
    | 'leaderboard_position_changed';
  properties: {
    xpAmount?: number;
    totalXp?: number;
    level?: number;
    streakType?: 'daily_login' | 'yollr_bell' | 'heist_participation';
    streakCount?: number;
    rewardType?: string;
    rewardValue?: unknown;
    achievementId?: string;
    rank?: number;
    previousRank?: number;
  };
}

// Navigation Events
export interface NavigationEvent extends BaseAnalyticsEvent {
  category: 'navigation';
  eventName:
    | 'page_view'
    | 'screen_view'
    | 'tab_switched'
    | 'modal_opened'
    | 'modal_closed'
    | 'drawer_opened'
    | 'drawer_closed'
    | 'deep_link_opened';
  properties: {
    page?: string;
    screen?: string;
    tab?: string;
    modal?: string;
    drawer?: string;
    url?: string;
    previousPage?: string;
    timeOnPage?: number;
  };
}

// Performance Events
export interface PerformanceEvent extends BaseAnalyticsEvent {
  category: 'performance';
  eventName:
    | 'app_load_time'
    | 'api_response_time'
    | 'database_query_time'
    | 'render_time'
    | 'bundle_size'
    | 'memory_usage'
    | 'battery_level';
  properties: {
    duration: number;
    endpoint?: string;
    query?: string;
    component?: string;
    size?: number;
    memoryMB?: number;
    batteryPercent?: number;
  };
}

// Error Events
export interface ErrorEvent extends BaseAnalyticsEvent {
  category: 'error';
  eventName:
    | 'javascript_error'
    | 'api_error'
    | 'database_error'
    | 'validation_error'
    | 'network_error'
    | 'authentication_error'
    | 'permission_error';
  properties: {
    errorType: string;
    errorMessage: string;
    stackTrace?: string;
    component?: string;
    endpoint?: string;
    statusCode?: number;
    recoverable?: boolean;
  };
}

export type AnalyticsEvent = 
  | AuthEvent
  | EngagementEvent
  | ContentEvent
  | SocialEvent
  | GamificationEvent
  | NavigationEvent
  | PerformanceEvent
  | ErrorEvent;

// Analytics aggregation types
export interface DailyMetrics {
  date: string;
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  sessions: number;
  avgSessionDuration: number;
  bounceRate: number;
  totalEvents: number;
  eventsByCategory: Record<AnalyticsEventCategory, number>;
}

export interface CampusMetrics {
  campusId: string;
  totalUsers: number;
  activeUsers: number;
  totalMoments: number;
  totalPolls: number;
  totalHeistSubmissions: number;
  totalReactions: number;
  totalXpAwarded: number;
  engagementRate: number;
  topContent: Array<{
    contentId: string;
    contentType: string;
    engagementCount: number;
  }>;
}

export interface UserAnalytics {
  userId: string;
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  momentsCreated: number;
  pollsCreated: number;
  heistSubmissions: number;
  reactionsGiven: number;
  votesCast: number;
  lastActive: string;
  engagementScore: number;
}

export interface ContentAnalytics {
  contentId: string;
  contentType: string;
  views: number;
  reactions: number;
  comments: number;
  shares: number;
  engagementRate: number;
  createdAt: string;
  authorId: string;
}

export interface FeatureAnalytics {
  featureName: string;
  usageCount: number;
  uniqueUsers: number;
  avgSessionDuration: number;
  retentionRate: number;
  lastUsed: string;
}

export interface AnalyticsQuery {
  startDate?: string;
  endDate?: string;
  campusId?: string;
  userId?: string;
  eventCategory?: AnalyticsEventCategory;
  eventName?: string;
  groupBy?: 'hour' | 'day' | 'week' | 'month';
  metrics?: string[];
}

export interface AnalyticsReport {
  summary: {
    totalEvents: number;
    totalUsers: number;
    totalSessions: number;
    avgEngagementRate: number;
  };
  trends: Array<{
    timestamp: string;
    metrics: Record<string, number>;
  }>;
  breakdowns: {
    byCategory: Record<AnalyticsEventCategory, number>;
    byCampus: Record<string, number>;
    byFeature: Record<string, number>;
  };
  insights: string[];
  generatedAt: string;
}