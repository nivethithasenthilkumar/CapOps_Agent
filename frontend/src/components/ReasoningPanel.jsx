import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Activity, Brain } from 'lucide-react';

export default function ReasoningPanel({ steps, cxScore }) {
  const [expanded, setExpanded] = useState({});

  // Auto-expand latest step
  useEffect(() => {
    if (steps.length > 0) {
      setExpanded(prev => ({ ...prev, [steps.length - 1]: true }));
    }
  }, [steps]);

  const toggle = (idx) => setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }));

  const statusColors = {
    green: 'bg-green-500 shadow-green-200',
    amber: 'bg-amber-500 shadow-amber-200',
    red: 'bg-red-500 shadow-red-200'
  };

  const cxColor = cxScore >= 80 ? 'text-green-700 bg-green-50 border-green-200' : 
                  cxScore >= 50 ? 'text-amber-700 bg-amber-50 border-amber-200' : 
                  'text-red-700 bg-red-50 border-red-200';

  return (
    <div className="flex flex-col h-full bg-slate-50 relative z-10 shadow-[-10px_0_20px_-5px_rgba(0,0,0,0.03)] border-l border-slate-200">
      <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-white sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="bg-blue-50 p-1.5 rounded-lg border border-blue-100">
            <Brain className="text-capblue" size={18} />
          </div>
          <h2 className="font-bold text-slate-800 tracking-tight">Agent Reasoning</h2>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 border shadow-sm ${cxColor}`}>
          <Activity size={14} />
          CX: {cxScore}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {steps.length === 0 ? (
          <div className="text-center text-slate-400 mt-10 p-8 border-2 border-dashed border-slate-200 rounded-xl bg-white/50">
            <Brain className="mx-auto mb-3 opacity-20" size={48} />
            <p className="text-sm font-medium">Waiting for interactions to show reasoning traces...</p>
          </div>
        ) : (
          steps.map((traceList, i) => (
            <div key={i} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white hover:shadow-md transition-shadow">
              <button 
                onClick={() => toggle(i)}
                className="w-full text-left p-4 bg-white hover:bg-slate-50 flex items-center justify-between transition-colors border-b border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 text-slate-500 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                    {i + 1}
                  </div>
                  <span className="font-semibold text-sm text-slate-700">Query Trace</span>
                </div>
                <span className="text-slate-400 bg-slate-50 p-1 rounded-full border border-slate-100">
                  {expanded[i] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </span>
              </button>
              
              {expanded[i] && (
                <div className="p-5 space-y-5 bg-slate-50/50 relative">
                  <div className="absolute left-7 top-7 bottom-7 w-px bg-slate-200" />
                  {traceList.map((step, j) => (
                    <div key={j} className="relative pl-7 group">
                      <div className={`absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-slate-50 shadow-md ${statusColors[step.status] || 'bg-slate-400'}`}></div>
                      <div className="flex flex-col gap-1.5 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-slate-100">
                            {step.label}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(step.timestamp * 1000).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-200 shadow-sm leading-relaxed font-medium group-hover:border-blue-200 transition-colors">
                          {step.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
