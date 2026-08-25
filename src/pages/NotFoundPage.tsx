import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, ArrowLeft, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-[#FEF6E9] dark:bg-[#2C210C] text-[#B0831E] dark:text-[#E9B949] flex items-center justify-center mx-auto border border-[#F8E0B0] dark:border-[#5C4212] shadow-sm">
        <Code2 className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-black text-[#1A202C] dark:text-white tracking-tight">
        404 - Page Not Found
      </h1>
      <p className="text-xs sm:text-sm text-[#718096] dark:text-[#A0AEC0] max-w-sm">
        The algorithm or page you are looking for has either been moved or doesn&apos;t exist.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E9B949] hover:bg-[#D4A32D] text-[#1A202C] text-xs font-bold shadow-sm transition-all"
      >
        <Home className="w-4 h-4" /> Back to Dashboard
      </Link>
    </div>
  );
};
