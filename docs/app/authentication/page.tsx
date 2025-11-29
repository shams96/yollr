import { Key, Shield, Smartphone, Lock, AlertCircle, CheckCircle, Code } from 'lucide-react'

const sections = [
  {
    id: 'overview',
    title: 'Authentication Overview',
    icon: Shield,
    content: [
      'Yollr uses Supabase Auth with phone-based OTP (One-Time Password) authentication. This guide covers the complete authentication flow, security measures, and implementation details.',
      'Stack: Supabase Auth, Phone OTP (SMS-based), JWT tokens with refresh, Row Level Security (RLS) policies'
    ]
  },
  {
    id: 'flow',
    title: 'Authentication Flow',
    icon: Key,
    steps: [
      'User enters phone number',
      'System sends 6-digit OTP via SMS',
      'User enters OTP',
      'System verifies OTP and creates session',
      'User is authenticated and can access the app'
    ]
  },
  {
    id: 'phone-format',
    title: 'Phone Number Format',
    icon: Smartphone,
    content: [
      'Yollr supports international phone numbers with automatic country code detection. Supported countries include US, CA, GB, AU, DE, FR, IT, ES, JP, KR, IN, BR, MX, AR, CO, ZA, NG, EG, TR, RU, CN.',
      'Phone Format: E.164 format (+1234567890)'
    ]
  },
  {
    id: 'security',
    title: 'Security Measures',
    icon: Lock,
    measures: [
      { name: 'Rate Limiting', description: '3 OTP requests/minute, 5 attempts/15 minutes per user' },
      { name: 'Phone Validation', description: 'E.164 format validation with country-specific rules' },
      { name: 'Session Management', description: 'JWT tokens with automatic refresh' },
      { name: 'Row Level Security', description: 'RLS policies for data isolation' }
    ]
  },
  {
    id: 'implementation',
    title: 'Implementation Example',
    icon: Code,
    code: `// Send OTP
const sendOtp = async (phone: string) => {
  const { error } = await supabase.auth.signInWithOtp({
    phone,
    options: { channel: 'sms' }
  });
};

// Verify OTP
const verifyOtp = async (otp: string) => {
  const { data: { session }, error } = await supabase.auth.verifyOtp({
    phone, token: otp, type: 'sms'
  });
};`
  },
  {
    id: 'error-handling',
    title: 'Error Handling',
    icon: AlertCircle,
    errors: [
      { code: 'INVALID_PHONE', message: 'Please enter a valid phone number' },
      { code: 'INVALID_OTP', message: 'Invalid verification code. Please try again.' },
      { code: 'EXPIRED_OTP', message: 'This code has expired. Please request a new one.' },
      { code: 'RATE_LIMITED', message: 'Too many attempts. Please try again later.' }
    ]
  },
  {
    id: 'best-practices',
    title: 'Best Practices',
    icon: CheckCircle,
    practices: [
      'Never log sensitive data (phone numbers, OTPs)',
      'Use HTTPS only for all auth requests',
      'Implement rate limiting to prevent brute force attacks',
      'Validate all inputs using Zod schemas',
      'Use secure cookies with httpOnly, secure, sameSite flags',
      'Auto-detect country to reduce user friction',
      'Show formatted numbers as user types',
      'Provide clear error messages',
      'Allow users to request new OTP codes',
      'Implement session persistence across page refreshes'
    ]
  }
]

export default function AuthenticationDocs() {
  return (
    <div className="bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Authentication Guide
          </h1>
          <p className="mt-4 text-xl text-gray-500">
            Complete guide to implementing phone-based OTP authentication
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

              {section.steps && (
                <ol className="mt-6 space-y-3">
                  {section.steps.map((step, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                        {idx + 1}
                      </span>
                      <span className="text-gray-600">{step}</span>
                    </li>
                  ))}
                </ol>
              )}

              {section.measures && (
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {section.measures.map((measure) => (
                    <div key={measure.name} className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900">{measure.name}</h4>
                      <p className="mt-1 text-sm text-gray-600">{measure.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {section.code && (
                <div className="mt-6 bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-gray-100">
                    <code>{section.code}</code>
                  </pre>
                </div>
              )}

              {section.errors && (
                <div className="mt-6 space-y-3">
                  {section.errors.map((error) => (
                    <div key={error.code} className="bg-red-50 border border-red-200 rounded-md p-4">
                      <div className="flex">
                        <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                        <div>
                          <h4 className="text-sm font-medium text-red-800">{error.code}</h4>
                          <p className="mt-1 text-sm text-red-700">{error.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {section.practices && (
                <ul className="mt-6 space-y-2">
                  {section.practices.map((practice, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{practice}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}