import React, { useState, useEffect } from 'react';
import { Mic } from 'lucide-react';

export default function VoiceInput({ sessionId, onResult }) {
  const [recording, setRecording] = useState(false);
  const [lang, setLang] = useState('en-IN');
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      
      rec.onresult = (event) => {
        const text = event.results[0][0].transcript;
        onResult(text);
        setRecording(false);
      };
      
      rec.onerror = (e) => {
        console.error("Speech recognition error", e);
        setRecording(false);
      };
      
      rec.onend = () => setRecording(false);
      setRecognition(rec);
    }
  }, [onResult]);

  const toggleRecording = () => {
    if (!recognition) return alert("Speech recognition not supported in this browser.");
    
    if (recording) {
      recognition.stop();
    } else {
      recognition.lang = lang;
      recognition.start();
      setRecording(true);
    }
  };

  return (
    <div className="flex items-center gap-2 pr-1">
      <select 
        value={lang} 
        onChange={(e) => setLang(e.target.value)}
        className="text-[10px] bg-white border border-slate-200 text-slate-600 rounded p-1 outline-none uppercase font-bold tracking-widest shadow-sm shadow-slate-200/50"
      >
        <option value="en-IN">EN</option>
        <option value="hi-IN">HI</option>
      </select>
      <button 
        onClick={toggleRecording}
        className={`p-2.5 rounded-full transition-all flex items-center justify-center ${
          recording 
            ? 'bg-red-100 text-red-600 animate-pulse ring-4 ring-red-500/20 shadow-inner' 
            : 'bg-white border border-slate-200 shadow-sm shadow-slate-200/50 text-slate-500 hover:bg-slate-50 hover:text-capblue hover:border-blue-200'
        }`}
        title={recording ? "Listening..." : "Use voice input"}
      >
        <Mic size={18} />
      </button>
    </div>
  );
}
