import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Shield, ThumbsUp, Filter, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGetLawyerDashboard, useListLawyerReviews } from '@workspace/api-client-react';
import FormSelect from '@/components/forms/FormSelect';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

const reviewGradients = [
  "from-pink-500 to-rose-700",
  "from-orange-500 to-red-700",
  "from-purple-500 to-fuchsia-700",
  "from-gray-500 to-slate-700",
  "from-indigo-500 to-violet-700",
];

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  starDistribution: Array<{ stars: number; count: number; percentage: number }>;
  caseTypeHighlights: Array<{ name: string; count: number }>;
}

const Reviews = () => {
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [draftReply, setDraftReply] = useState('');
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [helpful, setHelpful] = useState<Record<string, number>>({});
  const [helpfulClicked, setHelpfulClicked] = useState<Record<string, boolean>>({});
  const { data: lawyerData } = useGetLawyerDashboard();
  const { data: reviews } = useListLawyerReviews();
  const { data: stats } = useQuery<ReviewStats>({
    queryKey: ['reviewStats'],
    queryFn: async () => {
      const res = await fetch('/api/lawyer/reviews/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    },
  });
  const loggedInLawyer = lawyerData ?? { name: "", initials: "", gradient: "", specialization: "", city: "", rating: 0, reviewCount: 0, isVerified: false, isPremium: false, email: "", phone: "", experience: 0, casesWon: 0, totalCases: 0, consultationFee: 0 };

  const reviewsData = (reviews ?? []).map((r, i) => ({
    id: r.id,
    clientName: r.author,
    initials: r.author.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join(''),
    gradient: reviewGradients[i % reviewGradients.length],
    city: "",
    rating: r.rating,
    rawDate: r.date,
    date: new Date(r.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    caseType: r.caseType,
    comment: r.comment,
    isVerified: false,
    helpful: helpful[r.id] ?? 0,
    reply: replies[r.id] ?? "",
  }));

  const filteredReviews = reviewsData
    .filter(r => {
      if (filter === '5') return r.rating === 5;
      if (filter === '4') return r.rating === 4;
      return true;
    })
    .sort((a, b) => {
      const da = new Date(a.rawDate).getTime();
      const db = new Date(b.rawDate).getTime();
      if (filter === 'recent') return db - da;
      return sort === 'newest' ? db - da : da - db;
    });

  const displayRating = stats?.averageRating ?? loggedInLawyer.rating;
  const displayCount = stats?.totalReviews ?? loggedInLawyer.reviewCount;
  const starDist = stats?.starDistribution ?? [
    { stars: 5, count: 0, percentage: 0 },
    { stars: 4, count: 0, percentage: 0 },
    { stars: 3, count: 0, percentage: 0 },
    { stars: 2, count: 0, percentage: 0 },
    { stars: 1, count: 0, percentage: 0 },
  ];
  const highlights = stats?.caseTypeHighlights ?? [];

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="font-serif text-3xl font-bold">Client Reviews</h2>
      </div>

      {/* Rating Summary Card */}
      <div className="glass-card rounded-3xl p-6 md:p-8 border border-white/10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
        <div className="flex flex-col items-center shrink-0">
          <div className="font-serif text-6xl md:text-7xl font-bold text-[#D4AF37] leading-none mb-2">
            {displayRating}
          </div>
          <div className="flex gap-1 text-[#D4AF37] mb-2">
            {[1,2,3,4,5].map(s => <Star key={s} className="w-5 h-5" fill="currentColor" />)}
          </div>
          <div className="text-gray-400 text-sm font-medium">{displayCount} reviews</div>
        </div>

        <div className="flex-1 w-full max-w-md">
          {starDist.map((bar) => (
            <div key={bar.stars} className="flex items-center gap-3 mb-2 last:mb-0">
              <div className="text-sm font-medium text-gray-300 w-4">{bar.stars}</div>
              <Star className="w-3 h-3 text-gray-500 shrink-0" fill="currentColor" />
              <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[#D4AF37] rounded-full" style={{ width: `${bar.percentage}%` }} />
              </div>
              <div className="text-xs text-gray-500 w-8 text-right">{bar.percentage}%</div>
            </div>
          ))}
        </div>

        {highlights.length > 0 && (
          <div className="hidden lg:flex flex-col gap-3 pl-12 border-l border-white/10 shrink-0">
            <div className="text-sm text-gray-400 font-semibold mb-1">Top Case Types</div>
            {highlights.map((h) => (
              <div key={h.name} className="bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-2">
                {h.name} <span className="bg-[#D4AF37] text-[#102542] px-1.5 py-0.5 rounded text-[10px]">{h.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide flex-1">
          {[
            { id: "all", label: "All Reviews" },
            { id: "5", label: "5 Stars" },
            { id: "4", label: "4 Stars" },
            { id: "recent", label: "Most Recent" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={cn(
                "whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 border",
                filter === tab.id 
                  ? "bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/50" 
                  : "bg-transparent text-gray-400 border-transparent hover:bg-white/5 hover:text-white"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="shrink-0 hidden md:block">
           <FormSelect label="" name="sort" value={sort} options={[{label: "Newest First", value: "newest"}, {label: "Oldest First", value: "oldest"}]} onChange={(e) => setSort(e.target.value as 'newest' | 'oldest')} className="!w-40" />
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence>
          {filteredReviews.map((review, i) => (
            <motion.div 
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-2xl p-5 md:p-6 border border-white/10 flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-serif font-bold text-white shadow-inner bg-gradient-to-br", review.gradient)}>
                    {review.initials}
                  </div>
                  <div>
                    <div className="font-serif font-bold text-white text-sm md:text-base flex items-center gap-2">
                      {review.clientName}
                      {review.isVerified && <Shield className="w-3 h-3 text-green-400" />}
                    </div>
                    <div className="text-xs text-gray-400">{review.city} • {review.date}</div>
                  </div>
                </div>
                <div className="text-xs font-semibold text-[#D4AF37] border border-[#D4AF37]/30 bg-[#D4AF37]/5 px-2 py-1 rounded uppercase tracking-wider shrink-0">
                  {review.caseType}
                </div>
              </div>

              <div className="flex gap-1 text-[#D4AF37] mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4" fill={i < review.rating ? "currentColor" : "none"} />
                ))}
              </div>

              <p className="text-sm text-gray-300 leading-relaxed mb-6 flex-1">"{review.comment}"</p>

              {review.reply ? (
                <div className="mt-auto pl-4 border-l-2 border-[#D4AF37]/30 py-2 bg-white/[0.02] rounded-r-lg pr-4">
                  <div className="text-xs font-bold text-gray-400 mb-1 flex items-center gap-1.5">
                    <MessageSquare className="w-3 h-3" /> {loggedInLawyer.name} replied:
                  </div>
                  <p className="text-sm text-gray-300 italic">{review.reply}</p>
                </div>
              ) : replyingTo === review.id ? (
                <div className="mt-auto flex flex-col gap-2">
                  <textarea 
                    value={draftReply}
                    onChange={(e) => setDraftReply(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#D4AF37]/50 outline-none resize-none"
                    placeholder="Write a public reply..."
                    rows={3}
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => { setReplyingTo(null); setDraftReply(''); }} className="text-xs font-semibold text-gray-400 hover:text-white px-3 py-1.5">Cancel</button>
                    <button onClick={() => {
                      if (!draftReply.trim()) { toast.error('Reply cannot be empty'); return; }
                      setReplies(prev => ({ ...prev, [review.id]: draftReply.trim() }));
                      setDraftReply('');
                      setReplyingTo(null);
                      toast.success('Reply posted');
                    }} className="bg-[#D4AF37] text-[#102542] text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-[#c4a133]">Post Reply</button>
                  </div>
                </div>
              ) : null}

              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <button onClick={() => {
                    if (helpfulClicked[review.id]) { toast('You already marked this helpful'); return; }
                    setHelpful(prev => ({ ...prev, [review.id]: (prev[review.id] ?? 0) + 1 }));
                    setHelpfulClicked(prev => ({ ...prev, [review.id]: true }));
                  }} className={cn("w-6 h-6 flex items-center justify-center rounded-full transition-colors", helpfulClicked[review.id] ? "bg-[#D4AF37]/20 text-[#D4AF37]" : "hover:bg-white/10 hover:text-white")}>
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  {review.helpful} people found this helpful
                </div>
                {!review.reply && replyingTo !== review.id && (
                  <button onClick={() => setReplyingTo(review.id)} className="text-xs font-semibold text-[#D4AF37] hover:underline">
                    Reply to Review
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Reviews;
