import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { sendMessage, sendVoice, sendImage } from '../api/client';
import SuggestionCard from './SuggestionCard';
import FeedbackBar from './FeedbackBar';
import VoiceInput from './VoiceInput';
import ImageUpload from './ImageUpload';

export default function ChatWindow({ sessionId, setSessionId, channel, setReasoningSteps, setCxScore, onEscalate }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (!sessionId) setMessages([]);
  }, [sessionId]);

  const handleSend = async (textOveride) => {
    const text = textOveride || input;
    if (!text.trim() && !textOveride) return;
    
    setInput('');
    const userMsg = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await sendMessage({
        session_id: sessionId,
        message: text,
        channel: channel,
        language: 'en'
      });
      processResponse(res.data);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'bot', content: "An error occurred connecting to the server.", isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  const processResponse = (data) => {
    if (data.session_id && !sessionId) {
      setSessionId(data.session_id);
    }
    
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'bot',
      content: data.text,
      intent: data.intent,
      sentiment: data.sentiment,
      source_doc: data.source_doc,
      action_chip: data.action_chip,
      recommended_action: data.recommended_action
    }]);

    if (data.reasoning_steps) setReasoningSteps(prev => [...prev, data.reasoning_steps]);
    if (data.cx_score !== undefined) setCxScore(data.cx_score);

    if (data.escalated) {
      onEscalate({ priority: data.escalation_priority, recommended_action: data.recommended_action });
    }
  };

  const sentimentEmoji = {
    positive: '😊', neutral: '😐', frustrated: '😟', angry: '😠'
  };

  const intentColor = {
    HR_LEAVE_QUERY: 'bg-purple-100 text-purple-700 border-purple-200',
    IT_ACCESS_REQUEST: 'bg-blue-100 text-blue-700 border-blue-200',
    PASSWORD_RESET: 'bg-orange-100 text-orange-700 border-orange-200',
    INVOICE_STATUS: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    ONBOARDING_HELP: 'bg-pink-100 text-pink-700 border-pink-200',
    COMPLAINT: 'bg-red-100 text-red-700 border-red-200',
    GENERAL: 'bg-gray-100 text-gray-700 border-gray-200'
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] z-0">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-blue-100 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-blue-200 transform hover:scale-105 transition-transform duration-300">
              <span className="text-3xl">🤖</span>
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">How can I assist you today?</h2>
            <p className="text-slate-500 mb-8 font-medium">I can help autonomously with IT access, HR leaves, invoices, and general onboarding queries.</p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Reset my password", "Apply for sick leave", "Invoice status"].map(q => (
                <button key={q} onClick={() => handleSend(q)} className="bg-white border border-slate-200 text-sm text-slate-600 px-5 py-2.5 rounded-full hover:bg-blue-50 hover:text-capblue hover:border-blue-200 transition-all shadow-sm font-semibold active:scale-95 duration-200">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300 fade-in`}>
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-2' : ''}`}>
              {msg.role === 'bot' && (
                <div className="flex items-center gap-2 mb-1.5 ml-1">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-capblue to-blue-400 flex items-center justify-center text-white text-[10px] font-black shadow-md border border-blue-500/30">
                    CA
                  </div>
                  <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">CapOps Agent</span>
                  {msg.sentiment && (
                    <span className="text-sm ml-1" title={`Sentiment: ${msg.sentiment}`}>{sentimentEmoji[msg.sentiment]}</span>
                  )}
                  {msg.intent && (
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow-sm tracking-wider ${intentColor[msg.intent] || intentColor.GENERAL}`}>
                      {msg.intent.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
              )}
              
              <div className={`p-4 rounded-2xl shadow-sm text-[15px] leading-relaxed relative ${
                msg.role === 'user' 
                  ? 'bg-capblue text-white rounded-tr-sm font-medium shadow-blue-500/20' 
                  : msg.isError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-white text-slate-700 border border-slate-200 rounded-tl-sm shadow-slate-200/50 hover:shadow-md transition-shadow'
              }`}>
                {msg.content}
                
                {msg.role === 'bot' && (msg.source_doc || msg.action_chip) && (
                  <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                    {msg.source_doc && msg.source_doc !== 'Unknown' && msg.source_doc !== 'None' && (
                      <div className="flex items-center gap-1.5 text-xs bg-slate-50 text-slate-600 px-2.5 py-1.5 rounded-lg shadow-sm border border-slate-200 font-bold hover:bg-slate-100 transition-colors cursor-default">
                        <FileText size={14} className="text-slate-400" />
                        Source: {msg.source_doc}
                      </div>
                    )}
                    {msg.action_chip && (
                      <div className="flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg shadow-sm border border-emerald-200 font-bold">
                        <CheckCircle size={14} className="text-emerald-500" />
                        {msg.action_chip}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {msg.role === 'bot' && !msg.isError && (
                <div className="mt-3 pl-2 flex flex-col gap-2">
                   <SuggestionCard action={msg.recommended_action} onSelect={(text) => handleSend(text)} />
                   <FeedbackBar sessionId={sessionId} messageId={msg.id} />
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="flex items-center gap-2 mb-1 ml-1">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-capblue to-blue-400 flex items-center justify-center text-white text-[10px] font-black shadow-md border border-blue-500/30">
                CA
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl rounded-tl-sm border border-slate-200 shadow-sm ml-2 flex items-center gap-3">
               <Loader2 className="animate-spin text-capblue" size={18} />
               <span className="text-sm text-slate-500 font-bold tracking-tight">Agent is thinking...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} className="h-1" />
      </div>

      <div className="p-4 bg-white border-t border-slate-200 shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.05)] z-20">
        <div className="flex items-end gap-3 max-w-4xl mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-capblue/30 focus-within:border-capblue transition-all shadow-inner">
          <ImageUpload 
            sessionId={sessionId} 
            onUploadStart={() => setLoading(true)}
            onUploadSuccess={processResponse}
            onUploadError={(e) => {
              setLoading(false);
              setMessages(prev => [...prev, { id: Date.now().toString(), role: 'bot', content: "Failed to upload image.", isError: true }]);
            }}
          />
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask a question or request an action..."
            className="px-3 py-3.5 bg-transparent flex-1 outline-none resize-none min-h-[52px] max-h-[150px] text-[15px] font-medium text-slate-700 placeholder-slate-400"
            rows={1}
          />
          <VoiceInput 
            sessionId={sessionId} 
            onResult={(text) => {
              setInput(text);
              handleSend(text);
            }} 
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="bg-capblue text-white p-3.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md transform active:scale-95 disabled:active:scale-100 flex items-center justify-center m-1"
          >
            <Send size={18} className={input.trim() ? "mr-0.5 mt-0.5" : ""} />
          </button>
        </div>
        <div className="text-center mt-3">
          <span className="text-[11px] text-slate-400 font-semibold tracking-wide uppercase">AI-generated responses may be inaccurate. Verify important information.</span>
        </div>
      </div>
    </div>
  );
}
