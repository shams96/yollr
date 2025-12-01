'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Upload, Image as ImageIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export default function HeistSubmissionPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [heistData, setHeistData] = useState<any>(null);
  const [loadingHeist, setLoadingHeist] = useState(true);

  // Fetch heist data to display title and validate submission window
  useEffect(() => {
    const fetchHeist = async () => {
      try {
        const response = await fetch(`/api/heist/${params.id}`);
        if (!response.ok) throw new Error('Failed to load heist');
        const data = await response.json();
        setHeistData(data);
      } catch (err) {
        setError('Failed to load heist data');
      } finally {
        setLoadingHeist(false);
      }
    };

    if (params.id) {
      fetchHeist();
    }
  }, [params.id]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
    }
  }, [user, authLoading, router]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image must be less than 10MB');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Upload image to storage if provided
      let imageUrl = null;
      if (imageFile) {
        // TODO: Implement actual image upload to Supabase storage
        // For now, we'll use the base64 preview (not recommended for production)
        imageUrl = imagePreview;
      }

      // Submit heist to backend
      const response = await fetch('/api/heist/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          heist_id: params.id,
          title: title.trim(),
          description: description.trim(),
          image_url: imageUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit heist');
      }

      // Show success and navigate back to heist page
      router.push(`/heist?success=submission&xp=${50}`);
    } catch (err: any) {
      setError(err.message || 'Failed to submit. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (authLoading || loadingHeist) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-accent-mint text-lg">Loading...</div>
      </div>
    );
  }

  // Show error if heist data failed to load
  if (!heistData) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <div className="text-text-primary font-bold text-xl mb-2">
            Failed to Load Heist
          </div>
          <p className="text-text-secondary mb-4">{error || 'Please try again later'}</p>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 bg-accent-mint text-gray-900 rounded-xl font-bold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

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
            <div>
              <h1 className="text-text-primary font-bold text-xl">
                Submit Your Heist
              </h1>
              <p className="text-text-muted text-sm">{heistData.title}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/30 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 text-red-400">
                <span className="text-xl">⚠️</span>
                <p className="text-sm font-medium">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Image Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <label className="text-text-primary font-semibold text-sm">
              Cover Image (Optional)
            </label>
            {imagePreview ? (
              <div className="relative aspect-video rounded-xl overflow-hidden bg-bg-card border border-white/10">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="absolute top-2 right-2 p-2 rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed border-white/20 hover:border-accent-mint/50 transition-colors cursor-pointer bg-bg-card/50 group"
              >
                <ImageIcon className="w-12 h-12 text-text-muted group-hover:text-accent-mint transition-colors mb-2" />
                <p className="text-text-secondary text-sm font-medium">
                  Click to upload image
                </p>
                <p className="text-text-muted text-xs mt-1">
                  PNG, JPG up to 10MB
                </p>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <label htmlFor="title" className="text-text-primary font-semibold text-sm">
              Submission Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your heist idea a catchy name..."
              required
              maxLength={100}
              className="w-full px-4 py-3 bg-bg-card border border-white/10 rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-mint/50 transition-colors"
            />
            <p className="text-text-muted text-xs text-right">
              {title.length}/100
            </p>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <label
              htmlFor="description"
              className="text-text-primary font-semibold text-sm"
            >
              Description *
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your epic Halloween event idea in detail. What makes it special? How will it bring the campus together?"
              required
              rows={8}
              maxLength={1000}
              className="w-full px-4 py-3 bg-bg-card border border-white/10 rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-mint/50 transition-colors resize-none"
            />
            <p className="text-text-muted text-xs text-right">
              {description.length}/1000
            </p>
          </motion.div>

          {/* Prize Reminder */}
          {heistData.prize_description && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-accent-mint/10 to-accent-lilac/10 border border-accent-mint/30 rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">🏆</div>
                <div>
                  <h3 className="text-text-primary font-bold text-sm mb-1">
                    Prize: {heistData.prize_description}
                  </h3>
                  <p className="text-text-secondary text-xs">
                    The winning submission will get their event fully funded and
                    executed on campus!
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-3"
          >
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-4 px-6 rounded-xl border border-white/20 text-text-primary font-bold hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title || !description || isSubmitting}
              className={cn(
                'flex-1 py-4 px-6 rounded-xl font-bold transition-all shadow-lg',
                title && description && !isSubmitting
                  ? 'bg-gradient-to-r from-accent-mint to-accent-lilac text-gray-900 hover:scale-105 active:scale-95'
                  : 'bg-bg-card text-text-muted cursor-not-allowed'
              )}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </div>
              ) : (
                'Submit Heist'
              )}
            </button>
          </motion.div>

          {/* Guidelines */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-bg-card/50 rounded-xl p-4 space-y-2 border border-white/10"
          >
            <h4 className="text-text-primary font-semibold text-sm">
              Submission Guidelines
            </h4>
            <ul className="text-text-muted text-xs space-y-1 list-disc list-inside">
              <li>Be creative and think big!</li>
              <li>Event must be inclusive and safe for all students</li>
              <li>Consider logistics, budget allocation, and timeline</li>
              <li>Explain how you'll promote and execute the event</li>
            </ul>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
