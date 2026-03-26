import React from 'react';
import { MessageSquare, Mail, Phone, Hash as SlackIcon, Shield as DiscordIcon } from 'lucide-react';

export default function ChannelSelector({ active, onChange }) {
  const channels = [
    { id: 'CHAT', label: 'Web Chat', icon: MessageSquare },
    { id: 'VOICE', label: 'Voice Call', icon: Phone },
    { id: 'EMAIL', label: 'Email', icon: Mail },
    { id: 'SLACK', label: 'Slack', icon: SlackIcon },
    { id: 'DISCORD', label: 'Discord', icon: DiscordIcon },
  ];

  return (
    <div className="p-5 border-b">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Origin Channel</h3>
      <div className="space-y-1.5">
        {channels.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              active === id 
                ? 'bg-blue-50 text-capblue shadow-sm border border-blue-100 ring-1 ring-blue-500/10' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
            }`}
          >
            <Icon size={16} className={active === id ? "text-capblue" : "text-gray-400"} />
            {label}
            {active === id && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-capblue"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
