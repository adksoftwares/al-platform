import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="py-6 border-t border-slate-800/80 bg-slate-950 text-center text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4">
        <p className="font-medium text-slate-400">
          Powered by <span className="text-brand-400 font-semibold">ADK Software Solutions</span>
        </p>
        <p className="mt-1 text-[11px] text-slate-600">
          G.C.E Advanced Level Educational Resource Platform • &copy; {new Date().getFullYear()} All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};
