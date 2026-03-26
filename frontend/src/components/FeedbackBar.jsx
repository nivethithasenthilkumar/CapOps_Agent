import React from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { submitFeedback } from '../api/client';

export default function FeedbackBar({ sessionId, messageId }) {
  const [rated, setRated] = React.useState(null);

  const handleRate = async (rating) => {
    if (rated) return;
    setRated(rating);
    try {
      await submitFeedback(sessionId, messageId, rating);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-1">
      {rated ? (
        <span className="text-[11px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-200 animate-in fade-in slide-in-from-left-2 shadow-sm">
          Thank you for the feedback!
        </span>
      ) : (
        <div className="flex gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
          <button onClick={() => handleRate('up')} className="p-1.5 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors border border-transparent hover:border-blue-200">
            <ThumbsUp size={14} />
          </button>
          <button onClick={() => handleRate('down')} className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors border border-transparent hover:border-red-200">
            <ThumbsDown size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
