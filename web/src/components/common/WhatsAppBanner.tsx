import React from 'react';
import { MessageSquare, ExternalLink } from 'lucide-react';

export const WhatsAppBanner: React.FC = () => {
  return (
    <a
      href="https://chat.whatsapp.com/LObMo9ICUz5AKs4BSurKNU?s=cl&p=a&mlu=4"
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-950/30 hover:shadow-xl hover:shadow-emerald-900/40 hover:scale-[1.01] transition-all duration-200"
    >
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl text-white group-hover:rotate-6 transition-transform">
          <MessageSquare className="w-6 h-6 fill-white/20" />
        </div>
        <div>
          <h4 className="font-bold text-base sm:text-lg tracking-tight flex items-center gap-1.5">
            Join our WhatsApp Community
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-300 animate-ping"></span>
          </h4>
          <p className="text-xs sm:text-sm text-emerald-100/90 font-medium">
            Get instant past paper updates, model papers, and discussions!
          </p>
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg group-hover:bg-white group-hover:text-emerald-700 transition-colors">
        <span>Join Now</span>
        <ExternalLink className="w-3.5 h-3.5" />
      </div>
    </a>
  );
};
