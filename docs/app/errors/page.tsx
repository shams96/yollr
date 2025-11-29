import { 
  AlertCircle, 
  Shield, 
  Database, 
  Zap, 
  Code, 
  Wifi, 
  Smartphone,
  FileText,
  LifeBuoy
} from 'lucide-react'

const errorCategories = [
  {
    id: 'authentication',
    title: 'Authentication Errors',
    icon: Shield,
    errors: [
      {
        code: 'INVALID_PHONE',
        message: 'Invalid phone number format',
        cause: 'Phone number does not match E.164 format or country-specific rules',
        solution: 'Validate phone number format before sending OTP. Use the phone validation utility.',
        prevention: 'Implement client-side phone validation with real-time feedback'
      },
      {
        code: 'INVALID_OTP',
        message: 'Invalid or expired OTP',
        cause: 'OTP code is incorrect or has expired (15 minute lifetime)',
        solution: 'Request a new OTP code and ensure it\'s entered within 15 minutes',
        prevention: 'Show OTP expiration timer and allow easy resend'
      },
      {
        code: 'RATE_LIMITED',
        message: 'Too many OTP attempts',
        cause: 'Exceeded 5 OTP attempts within 15 minutes',
        solution: 'Wait 15 minutes before trying again or contact support',
        prevention: 'Implement progressive delays between attempts'
      },
      {
        code: 'SESSION_EXPIRED',
        message: 'Authentication session expired',
        cause: 'JWT token expired or refresh token invalid',
        solution: 'Re-authenticate with phone OTP',
        prevention: 'Implement automatic token refresh before expiration'
      }
    ]
  },
  {
    id: 'database',
    title: 'Database & RLS Errors',
    icon: Database,
    errors: [
      {
        code: 'PERMISSION_DENIED',
        message: 'Insufficient permissions',
        cause: 'Row Level Security policy blocked the operation',
        solution: 'Check RLS policies and user role/permissions',
        prevention: 'Test RLS policies with different user roles during development'
      },
      {
        code: 'CONSTRAINT_VIOLATION',
        message: 'Database constraint violation',
        cause: 'Unique constraint, foreign key, or check constraint failed',
        solution: 'Validate data before insertion and handle conflicts gracefully',
        prevention: 'Implement proper validation and duplicate checking'
      },
      {
        code: 'JWT_CLAIM_MISSING',
        message: 'Missing JWT claim',
        cause: 'RLS policy requires a claim that\'s not in the JWT token',
        solution: 'Check JWT token contents and RLS policy requirements',
        prevention: 'Ensure all required user data is in JWT claims'
      }
    ]
  },
  {
    id: 'api',
    title: 'API & Edge Function Errors',
    icon: Zap,
    errors: [
      {
        code: 'FUNCTION_TIMEOUT',
        message: 'Edge Function execution timeout',
        cause: 'Function exceeded 30-second execution limit',
        solution: 'Optimize function code and reduce external API calls',
        prevention: 'Implement caching and optimize database queries'
      },
      {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'API rate limit exceeded',
        cause: 'Too many requests (60/minute per user)',
        solution: 'Implement request throttling and exponential backoff',
        prevention: 'Cache responses and batch requests where possible'
      },
      {
        code: 'STORAGE_ERROR',
        message: 'File upload failed',
        cause: 'Network issue, file size limit, or storage permission',
        solution: 'Check file size, network connection, and storage policies',
        prevention: 'Validate file size client-side and implement retry logic'
      }
    ]
  },
  {
    id: 'realtime',
    title: 'Real-time & Webhook Errors',
    icon: Code,
    errors: [
      {
        code: 'WEBSOCKET_DISCONNECTED',
        message: 'Real-time connection lost',
        cause: 'Network issues or server restart',
        solution: 'Implement reconnection logic with exponential backoff',
        prevention: 'Monitor connection status and reconnect automatically'
      },
      {
        code: 'WEBHOOK_FAILED',
        message: 'Webhook delivery failed',
        cause: 'Endpoint returned error or timeout',
        solution: 'Check webhook endpoint logs and retry delivery',
        prevention: 'Implement webhook endpoint with proper error handling'
      },
      {
        code: 'SIGNATURE_INVALID',
        message: 'Invalid webhook signature',
        cause: 'Signature verification failed',
        solution: 'Verify webhook secret and signature calculation',
        prevention: 'Use constant-time comparison for signatures'
      }
    ]
  },
  {
    id: 'client',
    title: 'Client-Side Errors',
    icon: Smartphone,
    errors: [
      {
        code: 'NETWORK_ERROR',
        message: 'Network request failed',
        cause: 'No internet connection or CORS issues',
        solution: 'Check network connection and API endpoint accessibility',
        prevention: 'Implement offline detection and graceful degradation'
      },
      {
        code: 'STORAGE_FULL',
        message: 'Local storage quota exceeded',
        cause: 'Browser storage limit reached',
        solution: 'Clear cache or use alternative storage',
        prevention: 'Implement storage quota checks and cleanup'
      },
      {
        code: 'VIDEO_UPLOAD_FAILED',
        message: 'Video upload failed',
        cause: 'Network issue, file size, or format not supported',
        solution: 'Check file format, size, and network connection',
        prevention: 'Validate video format and size before upload'
      },
      {
        code: 'PERMISSION_DENIED',
        message: 'Camera/microphone permission denied',
        cause: 'User denied browser permission request',
        solution: 'Guide user to enable permissions in browser settings',
        prevention: 'Explain why permissions are needed before requesting'
      }
    ]
  }
]

const troubleshootingSteps = [
  {
    title: 'Check Browser Console',
    description: 'Open browser developer tools and check for errors in the console',
    priority: 'high'
  },
  {
    title: 'Verify Network Requests',
    description: 'Check Network tab for failed requests and their status codes',
    priority: 'high'
  },
  {
    title: 'Test Authentication',
    description: 'Ensure user is authenticated and has valid session',
    priority: 'medium'
  },
  {
    title: 'Check Supabase Status',
    description: 'Verify Supabase project is running and accessible',
    priority: 'medium'
  },
  {
    title: 'Review RLS Policies',
    description: 'Test RLS policies with current user context',
    priority: 'low'
  }
]

export default function ErrorHandlingDocs() {
  return (
    <div className="bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Error Handling & Troubleshooting
          </h1>
          <p className="mt-4 text-xl text-gray-500">
            Comprehensive guide to debugging and resolving common issues
          </p>
        </div>

        <div className="mb-12 bg-red-50 rounded-lg p-8">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-8 w-8 text-red-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Quick Troubleshooting Steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {troubleshootingSteps.map((step) => (
              <div key={step.title} className="bg-white rounded-lg p-4">
                <div className="flex items-start">
                  <span className={`flex-shrink-0 w-3 h-3 rounded-full mt-2 mr-3 ${
                    step.priority === 'high' ? 'bg-red-500' :
                    step.priority === 'medium' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`} />
                  <div>
                    <h3 className="font-medium text-gray-900">{step.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-12">
          {errorCategories.map((category) => (
            <section key={category.id} id={category.id} className="scroll-mt-24">
              <div className="flex items-center mb-6">
                <category.icon className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">{category.title}</h2>
              </div>
              
              <div className="space-y-6">
                {category.errors.map((error) => (
                  <div key={error.code} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm mr-2">{error.code}</code>
                          {error.message}
                        </h3>
                      </div>
                      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Cause</h4>
                        <p className="text-sm text-gray-600">{error.cause}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Solution</h4>
                        <p className="text-sm text-gray-600">{error.solution}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Prevention</h4>
                        <p className="text-sm text-gray-600">{error.prevention}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section id="debugging" className="mt-12 scroll-mt-24">
          <div className="flex items-center mb-6">
            <Code className="h-8 w-8 text-green-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Debugging Tools</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Supabase Debug Mode</h3>
              <div className="bg-gray-900 rounded-lg p-4">
                <pre className="text-sm text-gray-100">
                  <code># In .env.local
NEXT_PUBLIC_DEBUG=true

# In browser console
localStorage.setItem('debug', 'supabase:*')</code>
                </pre>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Enable debug logging to see detailed Supabase client operations
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Common Debug Commands</h3>
              <div className="space-y-3">
                <div>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">supabase status</code>
                  <p className="text-sm text-gray-600 mt-1">Check if Supabase is running</p>
                </div>
                <div>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">supabase logs --target auth</code>
                  <p className="text-sm text-gray-600 mt-1">View authentication logs</p>
                </div>
                <div>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">supabase db connect</code>
                  <p className="text-sm text-gray-600 mt-1">Connect to database directly</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="support" className="mt-12 scroll-mt-24">
          <div className="bg-blue-50 rounded-lg p-8">
            <div className="flex items-center mb-4">
              <LifeBuoy className="h-8 w-8 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Need More Help?</h2>
            </div>
            <p className="text-gray-600 mb-6">
              If you're still experiencing issues after following this guide, our support team is here to help.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="/support"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Contact Support
              </a>
              <a
                href="https://discord.gg/yollr"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Join Discord Community
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}