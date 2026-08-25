import React, { useState } from 'react';
import { Quote as QuoteIcon, RefreshCw } from 'lucide-react';
import { DAILY_QUOTES } from '../../lib/constants';

export const DailyQuoteCard: React.FC = () => {
  const [index, setIndex] = useState(0);

  const quote = DAILY_QUOTES[index % DAILY_QUOTES.length];

  const handleNextQuote = () => {
    setIndex((prev) => (prev + 1) % DAILY_QUOTES.length);
  };

  return (
    <div className="p-5 rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-purple-500/10 dark:from-indigo-950/20 dark:to-purple-950/20 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <QuoteIcon className="w-4 h-4 text-indigo-500" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Daily Developer Spark
          </h4>
        </div>
        <button
          onClick={handleNextQuote}
          className="p-1 rounded-lg text-slate-400 hover:text-indigo-500 transition-colors"
          title="New quote"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="my-auto py-2">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 italic leading-relaxed">
          &quot;{quote.quote}&quot;
        </p>
        <span className="text-xs font-semibold text-indigo-500 block mt-2">
          — {quote.author}
        </span>
      </div>
    </div>
  );
};
