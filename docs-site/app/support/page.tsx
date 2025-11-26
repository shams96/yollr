import {
  LifeBuoy,
  MessageCircle,
  Mail,
  Github,
  BookOpen,
  Video,
  Code,
  HelpCircle,
  AlertTriangle,
  Clock,
  Users,
  Shield,
  Zap
} from 'lucide-react'

const supportChannels = [
  {
    name: 'Discord Community',
    description: 'Join our active developer community for real-time help and discussions',
    icon: MessageCircle,
    action: 'Join Discord',
    url: 'https://discord.gg/yollr',
    responseTime: 'Usually within minutes',
    features: ['Real-time chat', 'Community support', 'Developer discussions', 'Announcements']
  },
  {
    name: 'Email Support',
    description: 'Get direct help from our support team for technical issues',
    icon: Mail,
    action: 'Send Email',
    url: 'mailto:support@yollr.com',
    responseTime: 'Within 24 hours',
    features: ['Technical issues', 'Bug reports', 'Feature requests', 'Account help']
  },
  {
    name: 'GitHub Issues',
    description: 'Report bugs, request features, and track development progress',
    icon: Github,
    action: 'Open Issue',
    url: 'https://github.com/your-org/yollr/issues',
    responseTime: 'Within 48 hours',
    features: ['Bug tracking', 'Feature requests', 'Development roadmap', 'Contributions']
  },
  {
    name: 'Documentation',
    description: 'Comprehensive guides, API reference, and troubleshooting',
    icon: BookOpen,
    action: 'Browse Docs',
    url: '/',
    responseTime: 'Self-service',
    features: ['API reference', 'Setup guides', 'Code examples', 'Best practices']
  }
]

const faqCategories = [
  {
    title: 'Getting Started',
    icon: HelpCircle,
    questions: [
      {
        q: 'What are the system requirements for Yollr development?',
        a: 'You need Node.js 18+, npm 9+, Git 2.30+, Supabase CLI, and Vercel CLI. See our Developer Setup guide for detailed requirements.'
      },
      {
        q: 'How long does it take to set up a Yollr development environment?',
        a: 'Typically 30-60 minutes for experienced developers. The process includes installing dependencies, setting up Supabase, and configuring environment variables.'
      },
      {
        q: 'Can I use Yollr with my existing Supabase project?',
        a: 'Yes! Yollr is designed to work with existing Supabase projects. You can apply the Yollr schema to your current database.'
      }
    ]
  },
  {
    title: 'Authentication & Security',
    icon: Shield,
    questions: [
      {
        q: 'Which countries are supported for phone authentication?',
        a: 'We support 20+ countries including US, CA, GB, AU, DE, FR, IT, ES, JP, KR, IN, BR, MX, and more. Full list is in the Authentication guide.'
      },
      {
        q: 'What happens if a user enters the wrong OTP multiple times?',
        a: 'After 5 failed attempts within 15 minutes, the user is rate-limited. They must wait 15 minutes before trying again.'
      },
      {
        q: 'How secure is the phone OTP authentication system?',
        a: 'Very secure. It includes rate limiting, JWT tokens with refresh, Row Level Security, and automatic country code detection.'
      }
    ]
  },
  {
    title: 'Technical Issues',
    icon: AlertTriangle,
    questions: [
      {
        q: 'Why am I getting "permission denied" errors?',
        a: 'This is usually due to Row Level Security policies. Check that your user has the correct role and is properly authenticated.'
      },
      {
        q: 'My real-time subscriptions are not working. What should I check?',
        a: 'Verify WebSocket connections, check RLS policies, ensure proper channel subscription, and confirm network connectivity.'
      },
      {
        q: 'How do I debug Edge Function timeouts?',
        a: 'Check function logs, optimize database queries, implement caching, and reduce external API calls. Functions have a 30-second timeout.'
      }
    ]
  },
  {
    title: 'Features & Functionality',
    icon: Zap,
    questions: [
      {
        q: 'How does the feed ranking algorithm work?',
        a: 'The algorithm scores content based on type (heist, poll, moment), engagement metrics, time factors, and urgency. See Edge Functions documentation for details.'
      },
      {
        q: 'Can I customize the gamification system?',
        a: 'Yes! You can modify XP amounts, streak calculations, mystery box rewards, and leaderboard scoring through the database and functions.'
      },
      {
        q: 'What are the file size limits for video uploads?',
        a: 'Current limits are 50MB for moments and 100MB for heist submissions. These can be adjusted in Supabase storage settings.'
      }
    ]
  }
]

const resources = [
  {
    title: 'Video Tutorials',
    description: 'Step-by-step video guides for common tasks and features',
    icon: Video,
    links: [
      { text: 'Getting Started with Yollr', url: '#' },
      { text: 'Setting Up Authentication', url: '#' },
      { text: 'Working with the Feed API', url: '#' }
    ]
  },
  {
    title: 'Code Examples',
    description: 'Ready-to-use code snippets and integration examples',
    icon: Code,
    links: [
      { text: 'Authentication Implementation', url: '/authentication#implementation' },
      { text: 'Real-time Subscriptions', url: '/webhooks#subscriptions' },
      { text: 'Custom Feed Ranking', url: '/edge-functions#rank-feed-page' }
    ]
  },
  {
    title: 'Community Resources',
    description: 'Connect with other developers and share knowledge',
    icon: Users,
    links: [
      { text: 'Discord Community', url: 'https://discord.gg/yollr' },
      { text: 'GitHub Discussions', url: 'https://github.com/your-org/yollr/discussions' },
      { text: 'Developer Blog', url: '#' }
    ]
  }
]

export default function SupportDocs() {
  return (
    <div className="bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Support & Resources
          </h1>
          <p className="mt-4 text-xl text-gray-500">
            Get help, connect with the community, and find resources for Yollr development
          </p>
        </div>

        <section id="channels" className="mb-16">
          <div className="flex items-center mb-8">
            <LifeBuoy className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Support Channels</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {supportChannels.map((channel) => {
              const Icon = channel.icon
              return (
                <div key={channel.name} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{channel.name}</h3>
                      <p className="mt-1 text-gray-600">{channel.description}</p>
                      
                      <div className="mt-4 flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        Response time: {channel.responseTime}
                      </div>

                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900">Best for:</h4>
                        <ul className="mt-1 space-y-1">
                          {channel.features.map((feature) => (
                            <li key={feature} className="text-sm text-gray-600 flex items-center">
                              <span className="w-1 h-1 bg-gray-400 rounded-full mr-2" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-6">
                        <a
                          href={channel.url}
                          target={channel.url.startsWith('http') ? '_blank' : undefined}
                          rel={channel.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                        >
                          {channel.action}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section id="faq" className="mb-16">
          <div className="flex items-center mb-8">
            <HelpCircle className="h-8 w-8 text-green-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-8">
            {faqCategories.map((category) => {
              const Icon = category.icon
              return (
                <div key={category.title} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-6">
                    <Icon className="h-6 w-6 text-gray-600 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-900">{category.title}</h3>
                  </div>
                  
                  <div className="space-y-6">
                    {category.questions.map((qa, index) => (
                      <div key={index} className="border-b border-gray-100 last:border-b-0 pb-6 last:pb-0">
                        <h4 className="text-lg font-medium text-gray-900 mb-2">{qa.q}</h4>
                        <p className="text-gray-600">{qa.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section id="resources" className="mb-16">
          <div className="flex items-center mb-8">
            <BookOpen className="h-8 w-8 text-purple-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Additional Resources</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {resources.map((resource) => {
              const Icon = resource.icon
              return (
                <div key={resource.title} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Icon className="h-6 w-6 text-gray-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">{resource.title}</h3>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{resource.description}</p>
                  
                  <ul className="space-y-2">
                    {resource.links.map((link) => (
                      <li key={link.text}>
                        <a
                          href={link.url}
                          target={link.url.startsWith('http') ? '_blank' : undefined}
                          rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                        >
                          <span className="w-1 h-1 bg-blue-600 rounded-full mr-2" />
                          {link.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </section>

        <section id="emergency" className="mb-16">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-red-900">Emergency Support</h3>
            </div>
            
            <p className="text-red-800 mb-4">
              For critical issues affecting production applications, please use our emergency support channel.
            </p>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <h4 className="font-medium text-red-900">Emergency Email</h4>
                <a href="mailto:emergency@yollr.com" className="text-red-700 hover:text-red-900">
                  emergency@yollr.com
                </a>
                <p className="text-sm text-red-600 mt-1">Response within 2 hours</p>
              </div>
              
              <div>
                <h4 className="font-medium text-red-900">Emergency Phone</h4>
                <a href="tel:+1-555-0199" className="text-red-700 hover:text-red-900">
                  +1 (555) 0199
                </a>
                <p className="text-sm text-red-600 mt-1">24/7 for critical issues</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}