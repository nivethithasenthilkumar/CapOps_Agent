import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, Activity, CheckCircle, Clock, AlertTriangle, MessageSquare, ShieldAlert } from 'lucide-react';
import { getStats } from '../api/client';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#0070AD', '#38BDF8', '#818CF8', '#A78BFA', '#F472B6', '#FB923C'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getStats();
        setStats(res.data);
      } catch(e) { console.error(e) }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) return <div className="h-screen flex items-center justify-center text-slate-500 font-bold tracking-widest uppercase">Loading Analytics...</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8 font-sans overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors bg-white border border-slate-200 shadow-sm">
              <ArrowLeft className="text-slate-700" size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">Analytics Dashboard</h1>
              <p className="text-slate-500 font-medium mt-1">Real-time performance and CX metrics</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
              <span className="text-sm font-bold text-slate-700 uppercase tracking-widest">Worker 1</span>
            </div>
            <div className="w-px h-6 bg-slate-200"></div>
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
              <span className="text-sm font-bold text-slate-700 uppercase tracking-widest">Worker 2</span>
            </div>
          </div>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Queries</p>
              <h2 className="text-4xl font-black text-slate-800 tracking-tight">{stats.total_queries}</h2>
            </div>
            <div className="bg-blue-50 p-4 rounded-2xl text-capblue border border-blue-100 shadow-inner"><MessageSquare size={28} /></div>
          </div>
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Resolution Rate</p>
              <h2 className="text-4xl font-black text-slate-800 tracking-tight">{stats.resolution_rate}%</h2>
            </div>
            <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600 border border-emerald-100 shadow-inner"><CheckCircle size={28} /></div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 flex items-center justify-between relative overflow-hidden hover:shadow-md transition-shadow">
            {stats.escalations > 0 && <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-bl-xl shadow-sm tracking-widest">P1 Alerts</div>}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Escalations</p>
              <h2 className={`text-4xl font-black tracking-tight ${stats.escalations > 0 ? 'text-red-600' : 'text-slate-800'}`}>{stats.escalations}</h2>
            </div>
            <div className="bg-red-50 p-4 rounded-2xl text-red-600 border border-red-100 shadow-inner"><ShieldAlert size={28} /></div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Avg Response</p>
              <h2 className="text-4xl font-black text-slate-800 tracking-tight">{stats.avg_response_time}s</h2>
            </div>
            <div className="bg-amber-50 p-4 rounded-2xl text-amber-600 border border-amber-100 shadow-inner"><Clock size={28} /></div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-200/60">
            <h3 className="text-xl font-bold text-slate-800 mb-6 tracking-tight">Intent Distribution</h3>
            <div className="h-[300px]">
              {stats.top_intents_data && stats.top_intents_data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.top_intents_data}
                      cx="50%" cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                      label={({name, percent}) => `${name.replace(/_/g, ' ')} ${(percent * 100).toFixed(0)}%`}
                    >
                      {stats.top_intents_data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 font-medium border-2 mx-10 border-dashed border-slate-100 rounded-2xl">No intent data available</div>
              )}
            </div>
          </div>

          <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-200/60">
            <h3 className="text-xl font-bold text-slate-800 mb-6 tracking-tight">Sentiment Analysis</h3>
            <div className="h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.sentiment_distribution} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 700, fontSize: 13}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 600}} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {stats.sentiment_distribution?.map((entry, index) => {
                      const colors = { 'Positive': '#22c55e', 'Neutral': '#94a3b8', 'Frustrated': '#f59e0b', 'Angry': '#ef4444' };
                      return <Cell key={`cell-${index}`} fill={colors[entry.name] || '#38bdf8'} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-7 rounded-3xl shadow-sm border border-slate-200/60">
             <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 tracking-tight">
                <AlertTriangle className="text-amber-500" size={24} />
                Content Gap Suggestions
             </h3>
             <div className="space-y-4">
               {stats.content_gaps && stats.content_gaps.length > 0 ? (
                 stats.content_gaps.map((gap, i) => (
                   <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-slate-50/80 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors shadow-sm">
                     <div className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest whitespace-nowrap shadow-sm border border-amber-200">{gap.topic.replace(/_/g, ' ')}</div>
                     <p className="text-slate-700 font-medium leading-relaxed">{gap.query}</p>
                   </div>
                 ))
               ) : (
                 <p className="text-slate-500 font-medium p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center bg-slate-50">No content gaps identified yet. KB coverage is sufficient.</p>
               )}
             </div>
          </div>
          
          <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-200/60 flex flex-col items-center justify-center text-center">
             <div className="w-36 h-36 rounded-full border-[12px] border-capblue flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20 bg-blue-50/50">
               <span className="text-5xl font-black text-slate-800">{stats.feedback_score}%</span>
             </div>
             <h3 className="text-2xl font-black text-slate-800 tracking-tight">User Satisfaction</h3>
             <p className="text-slate-500 font-medium mt-3 max-w-[250px] leading-relaxed">Based on aggregate up/down votes during active sessions.</p>
             <div className="mt-8 flex items-center gap-2.5 bg-emerald-50 text-emerald-700 px-6 py-3 rounded-full font-bold shadow-sm border border-emerald-200">
               <Activity size={20} />
               Avg CX Score: {stats.avg_cx_score}
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
