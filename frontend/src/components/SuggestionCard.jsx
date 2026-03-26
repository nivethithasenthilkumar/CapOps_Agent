import React, { useState } from 'react';
import { Sparkles, X, ArrowRight } from 'lucide-react';

export default function SuggestionCard({ action, onSelect }) {
  const [dismissed, setDismissed] = useState(false);

  if (!action || action === 'Continue conversation' || dismissed) {
    return null;
  }

  return (
    <div className="bg-white border text-sm border-blue-100 rounded-xl p-4 shadow-sm relative max-w-[320px] animate-in slide-in-from-top-2 fade-in duration-300 group hover:border-blue-300 transition-colors">
      <button 
        onClick={() => setDismissed(true)} 
        className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
      >
        <X size={14} />
      </button>
      
      <div className="flex items-center gap-2 mb-2 text-capblue">
        <Sparkles size={16} />
        <span className="font-bold text-xs uppercase tracking-wider">Next Best Action</span>
      </div>
      
      <p className="text-slate-700 font-medium mb-3 pr-4 leading-relaxed">{action}</p>
      
      <div className="space-y-1.5 border-t border-slate-100 pt-3">
        {['What is the status of my ticket?', 'I need to speak to a human'].map(s => (
          <button 
            key={s} 
            onClick={() => onSelect(s)}
            className="text-left w-full text-[13px] text-blue-600 font-medium hover:text-blue-800 hover:underline flex items-center justify-between group"
          >
            <span className="truncate">{s}</span>
            <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
          </button>
        ))}
      </div>
    </div>
  );
}
