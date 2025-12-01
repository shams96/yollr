'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Copy, Check } from 'lucide-react';

interface InviteCodeCardProps {
  inviteCode: string;
  username: string;
}

export default function InviteCodeCard({ inviteCode, username }: InviteCodeCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const inviteText = `Join me on Yollr! Use my invite code: ${inviteCode}`;

    try {
      await navigator.clipboard.writeText(inviteText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShare = async () => {
    const inviteText = `Join me on Yollr! Use my invite code: ${inviteCode}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Yollr',
          text: inviteText,
        });
      } catch (error) {
        console.error('Share failed:', error);
        handleCopy(); // Fallback to copy
      }
    } else {
      handleCopy(); // Fallback to copy if share not supported
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[#FF2D95]/20 to-[#FF6B35]/20 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
    >
      <div className="text-center space-y-4">
        <div>
          <p className="text-white/70 text-sm font-semibold mb-2">
            Your Invite Code
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/30">
            <p className="text-white text-3xl font-black tracking-wider">
              {inviteCode}
            </p>
          </div>
        </div>

        <p className="text-white/60 text-xs">
          Share your code and earn 50 XP when friends join!
        </p>

        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl text-white font-bold text-sm transition-all"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </button>

          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#FF2D95] to-[#FF6B35] hover:opacity-90 rounded-xl text-white font-bold text-sm transition-all"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
        </div>
      </div>
    </motion.div>
  );
}
