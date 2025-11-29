import { Database, Table, Key, Zap, Shield } from 'lucide-react'

const sections = [
  {
    id: 'overview',
    title: 'Database Overview',
    icon: Database,
    content: [
      'Yollr uses PostgreSQL with Supabase, featuring comprehensive schema design for social features, gamification, and campus isolation.',
      'Extensions: uuid-ossp, postgis, pg_trgm'
    ]
  },
  {
    id: 'enums',
    title: 'Enum Types',
    icon: Table,
    enums: [
      {
        name: 'profile_sport_type',
        values: ['football', 'basketball', 'soccer', 'baseball', 'softball', 'track', 'volleyball', 'tennis', 'swimming', 'golf', 'lacrosse', 'hockey', 'wrestling', 'cross_country', 'gymnastics', 'cheer', 'band', 'other']
      },
      {
        name: 'campus_type',
        values: ['university', 'college', 'high_school', 'community_college']
      },
      {
        name: 'heist_phase',
        values: ['submitting', 'voting', 'won', 'executing', 'completed']
      },
      {
        name: 'reaction_type',
        values: ['fire', 'laugh', 'heart', 'clap', 'mind_blown', 'sad', 'angry', 'star']
      }
    ]
  },
  {
    id: 'core-tables',
    title: 'Core Tables',
    icon: Table,
    tables: [
      {
        name: 'profiles',
        description: 'User profiles extending Supabase Auth users',
        columns: ['id', 'username', 'display_name', 'avatar_url', 'bio', 'sport_type', 'total_xp', 'current_streak', 'longest_streak', 'mystery_boxes_available']
      },
      {
        name: 'campuses',
        description: 'College/university campuses',
        columns: ['id', 'name', 'short_name', 'campus_type', 'domain', 'location', 'city', 'state', 'country', 'timezone', 'primary_color', 'secondary_color']
      },
      {
        name: 'campus_memberships',
        description: 'Links users to campuses with roles',
        columns: ['id', 'user_id', 'campus_id', 'role', 'joined_at', 'left_at', 'is_active']
      }
    ]
  },
  {
    id: 'content-tables',
    title: 'Content Tables',
    icon: Zap,
    tables: [
      {
        name: 'moments',
        description: 'User-generated video content (24-hour lifespan)',
        columns: ['id', 'campus_id', 'user_id', 'squad_id', 'caption', 'video_url', 'thumbnail_url', 'source', 'view_count', 'reaction_count', 'comment_count', 'expires_at']
      },
      {
        name: 'polls',
        description: 'Time-limited polls with urgency scoring',
        columns: ['id', 'campus_id', 'author_id', 'question', 'category', 'image_url', 'closes_at', 'total_votes']
      },
      {
        name: 'heists',
        description: 'Weekly campus challenges with 5-phase lifecycle',
        columns: ['id', 'campus_id', 'title', 'description', 'phase', 'image_url', 'submission_opens_at', 'submission_closes_at', 'voting_opens_at', 'voting_closes_at', 'winner_submission_id']
      }
    ]
  },
  {
    id: 'gamification',
    title: 'Gamification Tables',
    icon: Zap,
    tables: [
      {
        name: 'user_xp',
        description: 'Audit trail of XP earnings',
        columns: ['id', 'user_id', 'xp_amount', 'source', 'reference_id', 'created_at']
      },
      {
        name: 'streaks',
        description: 'Track user streaks for different activities',
        columns: ['id', 'user_id', 'streak_type', 'current_streak', 'longest_streak', 'last_activity_at', 'grace_period_used']
      },
      {
        name: 'mystery_boxes',
        description: 'Reward system with random prizes',
        columns: ['id', 'user_id', 'box_type', 'is_opened', 'reward_type', 'reward_value', 'opened_at']
      }
    ]
  },
  {
    id: 'rls',
    title: 'Row Level Security',
    icon: Shield,
    content: [
      'All tables have RLS enabled with campus isolation policies. Users only see content from their campus.',
      'Policies include: campus member access, user ownership, and moderator access.'
    ]
  }
]

export default function DatabaseDocs() {
  return (
    <div className="bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Database Schema
          </h1>
          <p className="mt-4 text-xl text-gray-500">
            Comprehensive database documentation for Yollr platform
          </p>
        </div>

        <div className="space-y-12">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <div className="flex items-center mb-6">
                <section.icon className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
              </div>
              
              <div className="prose prose-lg max-w-none">
                {section.content?.map((paragraph, idx) => (
                  <p key={idx} className="text-gray-600 mb-4">{paragraph}</p>
                ))}
              </div>

              {section.enums && (
                <div className="mt-6 space-y-6">
                  {section.enums.map((enumType) => (
                    <div key={enumType.name} className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">{enumType.name}</h3>
                      <div className="flex flex-wrap gap-2">
                        {enumType.values.map((value) => (
                          <span key={value} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {value}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {section.tables && (
                <div className="mt-6 space-y-6">
                  {section.tables.map((table) => (
                    <div key={table.name} className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900">{table.name}</h3>
                      <p className="mt-1 text-sm text-gray-600">{table.description}</p>
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Columns:</h4>
                        <div className="flex flex-wrap gap-2">
                          {table.columns.map((column) => (
                            <code key={column} className="text-sm bg-gray-100 px-2 py-1 rounded">
                              {column}
                            </code>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}