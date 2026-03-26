import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ChatWindow from './components/ChatWindow';
import Dashboard from './components/Dashboard';
import SessionControls from './components/SessionControls';
import ChannelSelector from './components/ChannelSelector';
import ReasoningPanel from './components/ReasoningPanel';
import EscalationBanner from './components/EscalationBanner';
import { clearSession } from './api/client';

function AppLayout() {
  const [sessionId, setSessionId] = useState(null);
  const [channel, setChannel] = useState('CHAT');
  const [reasoningSteps, setReasoningSteps] = useState([]);
  const [cxScore, setCxScore] = useState(100);
  const [escalated, setEscalated] = useState(false);
  const [escalationData, setEscalationData] = useState({});

  const handleClearSession = async () => {
    if (sessionId) {
      await clearSession(sessionId);
    }
    setSessionId(null);
    setReasoningSteps([]);
    setEscalated(false);
    setCxScore(100);
  };

  return (
    <div className="flex h-screen w-full bg-gray-100 font-sans overflow-hidden">
      {escalated && (
        <EscalationBanner 
          priority={escalationData.priority} 
          action={escalationData.recommended_action}
          onDismiss={() => setEscalated(false)}
        />
      )}
      
      {/* Left Sidebar */}
      <div className={`w-1/5 min-w-[250px] bg-white border-r flex flex-col ${escalated ? 'pt-14' : ''}`}>
        <div className="p-4 border-b pb-6 mt-4">
          <h1 className="text-2xl font-bold text-capblue mb-1">CapOps Agent</h1>
          <p className="text-sm text-gray-500">Intelligent BPO Assistant</p>
        </div>
        <SessionControls sessionId={sessionId} onClear={handleClearSession} />
        <ChannelSelector active={channel} onChange={setChannel} />
        
        <div className="mt-auto p-4 border-t">
          <a href="/dashboard" className="w-full flex items-center justify-center font-medium shadow-sm py-2 px-4 rounded bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors">
            View Analytics Dashboard
          </a>
        </div>
      </div>

      {/* Center - Chat Window */}
      <div className={`flex-1 flex flex-col relative ${escalated ? 'pt-12' : ''}`}>
        <ChatWindow 
          sessionId={sessionId} 
          setSessionId={setSessionId}
          channel={channel}
          setReasoningSteps={setReasoningSteps}
          setCxScore={setCxScore}
          onEscalate={(data) => {
            setEscalated(true);
            setEscalationData(data);
          }}
        />
      </div>

      {/* Right Sidebar - Reasoning */}
      <div className={`w-[300px] shrink-0 bg-white border-l transition-all ${escalated ? 'pt-12' : ''}`}>
        <ReasoningPanel steps={reasoningSteps} cxScore={cxScore} />
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
