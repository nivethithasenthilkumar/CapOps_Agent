import React, { useState } from 'react';
import { RefreshCw, Hash } from 'lucide-react';

export default function SessionControls({ sessionId, onClear }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [reason, setReason] = useState('End of call');

  const handleClear = () => {
    onClear();
    setShowConfirm(false);
    
    // Simple toast
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 left-4 bg-gray-800 text-white px-4 py-3 rounded shadow-lg z-50 text-sm font-medium flex items-center gap-2 transform translate-y-0 opacity-100 transition-all duration-300';
    toast.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Session cleared. Starting fresh.';
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  return (
    <div className="p-5 border-b">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Session Details</h3>
      
      <div className="flex items-center gap-3 mb-5 bg-gray-50 px-3 py-2.5 rounded border border-gray-100">
        <div className="bg-gray-200 p-1.5 rounded-full">
          <Hash size={14} className="text-gray-500" />
        </div>
        <span className="font-mono text-sm text-gray-700 truncate font-medium">
          {sessionId ? sessionId.split('-')[0] : 'No active session'}
        </span>
      </div>

      {showConfirm ? (
        <div className="bg-red-50 p-4 rounded border border-red-100 flex flex-col gap-3 shadow-sm">
          <p className="text-sm text-red-800 font-semibold">Clear active session?</p>
          <select 
            className="text-sm border-gray-200 rounded p-2 w-full bg-white text-gray-700 focus:ring-1 focus:ring-red-500 outline-none"
            value={reason} onChange={e => setReason(e.target.value)}
          >
            <option>End of call</option>
            <option>Data privacy</option>
            <option>New customer</option>
            <option>Other</option>
          </select>
          <div className="flex gap-2 mt-1">
            <button onClick={handleClear} className="bg-red-600 text-white font-medium text-xs px-3 py-2 rounded flex-1 hover:bg-red-700 transition shadow-sm">Confirm</button>
            <button onClick={() => setShowConfirm(false)} className="bg-white border border-gray-300 text-gray-700 font-medium text-xs px-3 py-2 rounded flex-1 hover:bg-gray-50 transition shadow-sm">Cancel</button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setShowConfirm(true)}
          disabled={!sessionId}
          className="w-full flex items-center justify-center gap-2 bg-white border shadow-sm border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 font-medium text-sm py-2 px-4 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={16} />
          Clear Session
        </button>
      )}
    </div>
  );
}
