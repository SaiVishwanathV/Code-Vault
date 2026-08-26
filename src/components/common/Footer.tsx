import React from 'react';
import { Code2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] py-6 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#718096] dark:text-[#A0AEC0]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[#E9B949] text-[#1A202C] flex items-center justify-center font-bold text-[10px]">
            <Code2 className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-[#2D3748] dark:text-[#E2E8F0]">
            CodeVault – Coders Space
          </span>
          <span className="hidden sm:inline">&bull;</span>
          <span>&copy; {new Date().getFullYear()} CodeVault &bull; Designed &amp; Maintained by Sai Vishwanath V</span>
        </div>

        <div className="flex items-center gap-5 font-medium">
          <Link to="/about" className="hover:text-[#1A202C] dark:hover:text-white transition-colors">
            About &amp; Support
          </Link>
          <Link to="/community" className="hover:text-[#1A202C] dark:hover:text-white transition-colors">
            Community
          </Link>
        </div>
      </div>
    </footer>
  );
};
