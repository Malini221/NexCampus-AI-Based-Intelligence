import React, { useState } from 'react';

interface FeedbackItem {
  id: string;
  category: string;
  facility: string;
  rating: number;
  comment: string;
  author: string;
  date: string;
  status: 'Implemented' | 'Under Review' | 'Acknowledged';
  upvotes: number;
  hasUpvoted?: boolean;
}

export const FeedbackView: React.FC = () => {
  const [category, setCategory] = useState('Dining & Food Services');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [facilityLocation, setFacilityLocation] = useState('');
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([
    {
      id: 'FB-401',
      category: 'Library & Study Spaces',
      facility: 'Main University Library (Floors 2 & 3)',
      rating: 5,
      comment:
        'The newly introduced 24/7 quiet study zone on Floor 3 with individual noise-dampening carrels during midterms made a massive difference. Hope this stays year-round!',
      author: 'A. Patel (CS Senior)',
      date: '2 days ago',
      status: 'Implemented',
      upvotes: 42,
    },
    {
      id: 'FB-398',
      category: 'Dining & Food Services',
      facility: 'Central Dining Hall',
      rating: 4,
      comment:
        'Expanding plant-based protein choices during dinner has been awesome. Would love to see nutritional macro breakdowns on the digital menu boards.',
      author: 'Anonymous Student',
      date: '5 days ago',
      status: 'Under Review',
      upvotes: 29,
    },
    {
      id: 'FB-389',
      category: 'Campus Transit & Shuttles',
      facility: 'Route 7 Shuttle Loop',
      rating: 4,
      comment:
        'The additional 8:15 AM departure on Route 7 eased the morning peak squeeze significantly. Real-time bus GPS tracking in the app has been super reliable.',
      author: 'Malini S. (#8842)',
      date: 'Oct 11, 2025',
      status: 'Implemented',
      upvotes: 18,
    },
  ]);

  const handleUpvote = (id: string) => {
    setFeedbackList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const hasUpvoted = item.hasUpvoted;
          return {
            ...item,
            upvotes: hasUpvoted ? item.upvotes - 1 : item.upvotes + 1,
            hasUpvoted: !hasUpvoted,
          };
        }
        return item;
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const newFeedback: FeedbackItem = {
      id: `FB-${Math.floor(402 + Math.random() * 500)}`,
      category,
      facility: facilityLocation.trim() || 'Campus Wide',
      rating,
      comment: comment.trim(),
      author: isAnonymous ? 'Anonymous Student' : 'Malini S. (#8842)',
      date: 'Just now',
      status: 'Acknowledged',
      upvotes: 1,
      hasUpvoted: true,
    };

    setFeedbackList([newFeedback, ...feedbackList]);
    setComment('');
    setFacilityLocation('');
    setRating(5);
    setIsAnonymous(false);

    setToastMessage('Your feedback was routed directly to Campus Operations.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto gap-5 pb-8">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-primary text-white shadow-xl flex items-center gap-3 border border-border-hover animate-bounce">
          <span className="material-symbols-outlined text-[22px] text-primary-fixed">thumb_up</span>
          <div className="flex flex-col">
            <span className="font-title text-sm font-semibold">Feedback Submitted</span>
            <span className="font-body-sm text-xs opacity-90">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-mono-code text-[10px] uppercase font-bold text-primary tracking-wider">
              CAMPUS VOICE &amp; FEEDBACK
            </span>
            <span className="text-[10px] text-outline">•</span>
            <span className="font-mono-code text-[10px] uppercase tracking-wider text-on-surface-variant">
              TERM 2025
            </span>
          </div>
          <h1 className="font-headline-md text-2xl font-bold text-on-surface tracking-tight leading-tight">
            Share Campus Feedback
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5 max-w-2xl leading-relaxed">
            Submit honest feedback, facility suggestions, or dining appraisals to campus administrators. Your input directly influences campus improvements and capital planning.
          </p>
        </div>

        {/* Stats Strip */}
        <div className="flex items-center gap-2 bg-surface-card p-2 rounded-xl shadow-xs border border-border-subtle shrink-0">
          <div className="px-3 py-1 flex flex-col border-r border-border-subtle">
            <span className="font-label-sm text-[10px] uppercase text-on-surface-variant tracking-wider">
              Satisfaction
            </span>
            <span className="font-title text-base font-bold text-status-resolved-fg mt-0.5">
              94.2%
            </span>
          </div>
          <div className="px-3 py-1 flex flex-col border-r border-border-subtle">
            <span className="font-label-sm text-[10px] uppercase text-on-surface-variant tracking-wider">
              Term Appraisals
            </span>
            <span className="font-title text-base font-bold text-on-surface mt-0.5">
              420+
            </span>
          </div>
          <div className="px-3 py-1 flex flex-col">
            <span className="font-label-sm text-[10px] uppercase text-on-surface-variant tracking-wider">
              Administrative
            </span>
            <span className="font-title text-base font-bold text-primary mt-0.5">
              100% Routed
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Form Left, Community Feed Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Form: 7 cols */}
        <div className="lg:col-span-7 bg-surface-card rounded-xl p-5 border border-border-subtle shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[19px]">rate_review</span>
              </span>
              <div>
                <h2 className="font-headline-sm text-base font-bold text-on-surface">
                  Submit Facility Appraisal
                </h2>
                <span className="text-[11px] text-on-surface-variant">
                  Evaluations are reviewed by the Dean of Student Affairs weekly
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Category Select */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="fbCategory" className="text-xs font-semibold text-on-surface">
                Campus Category
              </label>
              <select
                id="fbCategory"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-border-subtle text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="Dining & Food Services">Dining & Food Services</option>
                <option value="Library & Study Spaces">Library & Study Spaces</option>
                <option value="Campus Transit & Shuttles">Campus Transit & Shuttles</option>
                <option value="Hostel Living & Maintenance">Hostel Living & Maintenance</option>
                <option value="Academic Facilities & Labs">Academic Facilities & Labs</option>
                <option value="Campus Security & Safety">Campus Security & Safety</option>
                <option value="General Campus Suggestion">General Campus Suggestion</option>
              </select>
            </div>

            {/* Star Rating Selection */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-on-surface">
                Overall Experience Rating
              </span>
              <div className="flex items-center gap-1.5 py-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 text-primary hover:scale-110 transition-transform cursor-pointer focus:outline-none"
                    >
                      <span className="material-symbols-outlined text-[28px]">
                        {isFilled ? 'star' : 'star_border'}
                      </span>
                    </button>
                  );
                })}
                <span className="ml-2 font-mono-code text-xs font-bold text-on-surface">
                  {rating === 5
                    ? '5.0 — Outstanding'
                    : rating === 4
                    ? '4.0 — Good'
                    : rating === 3
                    ? '3.0 — Average'
                    : rating === 2
                    ? '2.0 — Needs Improvement'
                    : '1.0 — Poor'}
                </span>
              </div>
            </div>

            {/* Targeted Location */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="fbLocation" className="text-xs font-semibold text-on-surface">
                Target Facility / Specific Location
              </label>
              <input
                id="fbLocation"
                type="text"
                value={facilityLocation}
                onChange={(e) => setFacilityLocation(e.target.value)}
                placeholder="e.g. Dining Hall, West Wing 2F, Main Library..."
                className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-border-subtle text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Comments & Suggestions */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="fbComment" className="text-xs font-semibold text-on-surface">
                Detailed Feedback &amp; Suggestions <span className="text-status-urgent-fg font-bold">*</span>
              </label>
              <textarea
                id="fbComment"
                required
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What went well? What could be improved? Specific suggestions help our teams take rapid action..."
                className="w-full p-3 rounded-lg bg-surface-container-low border border-border-subtle text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary resize-y"
              />
            </div>

            {/* Anonymous Toggle */}
            <div className="flex items-center gap-2 pt-1">
              <input
                id="anonCheck"
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-border-subtle cursor-pointer"
              />
              <label htmlFor="anonCheck" className="text-xs text-on-surface cursor-pointer select-none font-medium">
                Submit anonymously without attaching student ID #8842
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2 border-t border-border-subtle flex items-center justify-between">
              <span className="text-[11px] text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-status-resolved-fg">lock</span>
                Strictly confidential student appraisal protocol
              </span>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-primary text-white font-title text-xs font-semibold shadow-xs hover:bg-primary-container transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
                <span>Submit Feedback</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Community Voice Feed: 5 cols */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-headline-sm text-base font-bold text-on-surface">
                Community Appraisals
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-mono-code text-[11px]">
                {feedbackList.length} shared
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {feedbackList.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-surface-card border border-border-subtle shadow-xs flex flex-col gap-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-mono-code text-[10px] uppercase font-bold">
                        {item.category}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded font-mono-code text-[10px] uppercase font-bold ${
                          item.status === 'Implemented'
                            ? 'bg-status-resolved-bg text-status-resolved-fg'
                            : item.status === 'Under Review'
                            ? 'bg-status-progress-bg text-status-progress-fg'
                            : 'bg-surface-container text-on-surface-variant'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <span className="font-title text-xs font-bold text-on-surface mt-1">
                      {item.facility}
                    </span>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center text-primary shrink-0">
                    {[...Array(item.rating)].map((_, i) => (
                      <span key={i} className="material-symbols-outlined text-[15px]">
                        star
                      </span>
                    ))}
                  </div>
                </div>

                <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                  "{item.comment}"
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-border-subtle/70 text-[11px] text-on-surface-variant">
                  <span className="font-mono-code">
                    {item.author} • {item.date}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleUpvote(item.id)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors cursor-pointer ${
                      item.hasUpvoted
                        ? 'bg-primary-container/20 text-primary font-bold'
                        : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">thumb_up</span>
                    <span className="font-mono-code text-[10px]">{item.upvotes}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
