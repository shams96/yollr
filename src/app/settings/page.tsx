'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Bell,
  Shield,
  Palette,
  HelpCircle,
  LogOut,
  ChevronRight,
} from 'lucide-react';

const settingsSections = [
  {
    title: 'Account',
    items: [
      { icon: User, label: 'Profile Settings', description: 'Edit your profile information' },
      { icon: Shield, label: 'Privacy & Security', description: 'Manage your privacy settings' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { icon: Bell, label: 'Notifications', description: 'Customize notification preferences' },
      { icon: Palette, label: 'Appearance', description: 'Theme and display settings' },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: HelpCircle, label: 'Help & Support', description: 'Get help or report an issue' },
    ],
  },
];

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-bg-secondary/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-text-primary font-bold text-xl">Settings</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* User Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-bg-card rounded-2xl p-6 mb-6 border border-white/10"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-mint to-accent-lilac flex items-center justify-center text-2xl">
              🎓
            </div>
            <div className="flex-1">
              <h2 className="text-text-primary font-bold text-lg">Your Name</h2>
              <p className="text-text-secondary text-sm">@username</p>
              <p className="text-text-muted text-xs mt-1">Level 12 • 750 XP</p>
            </div>
            <button
              onClick={() => router.push('/profile/gems')}
              className="px-4 py-2 bg-accent-mint/20 text-accent-mint rounded-lg text-sm font-medium hover:bg-accent-mint/30 transition-colors"
            >
              View Profile
            </button>
          </div>
        </motion.div>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
            className="mb-6"
          >
            <h3 className="text-text-muted text-xs font-semibold uppercase tracking-wider px-4 mb-3">
              {section.title}
            </h3>
            <div className="bg-bg-card rounded-xl border border-white/10 overflow-hidden">
              {section.items.map((item, index) => (
                <button
                  key={item.label}
                  className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors border-b border-white/10 last:border-b-0"
                >
                  <div className="p-2 rounded-lg bg-bg-primary text-accent-mint">
                    <item.icon size={20} />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="text-text-primary font-medium text-sm">
                      {item.label}
                    </h4>
                    <p className="text-text-muted text-xs">{item.description}</p>
                  </div>
                  <ChevronRight className="text-text-muted" size={20} />
                </button>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <button className="w-full flex items-center justify-center gap-3 p-4 bg-bg-card rounded-xl border border-white/10 text-accent-coral hover:bg-accent-coral/10 transition-colors">
            <LogOut size={20} />
            <span className="font-semibold">Log Out</span>
          </button>
        </motion.div>

        {/* App Version */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8 text-text-muted text-xs"
        >
          Yollr v1.0.0
        </motion.div>
      </div>
    </div>
  );
}
