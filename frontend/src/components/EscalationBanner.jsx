import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function EscalationBanner({ priority, action, onDismiss }) {
  useEffect(() => {
    if (priority === 'P1') {
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
        audio.play().catch(e => console.log("Audio play blocked", e));
      } catch (e) {}
    }
  }, [priority]);

  const colors = {
    P1: 'bg-red-600',
    P2: 'bg-amber-600',
    P3: 'bg-yellow-600'
  };

  return (
    <div className={`absolute top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-3 text-white shadow-md ${colors[priority] || colors.P3}`}>
      <div className="flex items-center gap-4">
        <AlertTriangle size={20} className="animate-pulse" />
        <span className="font-bold border border-white/40 px-2 py-0.5 rounded text-sm bg-black/10 tracking-widest">
          {priority || 'P3'} ESCALATION
        </span>
        <span className="text-sm font-medium ml-2">Recommended Action: {action || 'Transfer to human agent immediately'}</span>
      </div>
      <button onClick={onDismiss} className="p-1.5 hover:bg-black/10 rounded transition-colors">
        <X size={18} />
      </button>
    </div>
  );
}
