import React, { useRef } from 'react';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import { sendImage } from '../api/client';

export default function ImageUpload({ sessionId, onUploadStart, onUploadSuccess, onUploadError }) {
  const fileInput = useRef(null);
  const [uploading, setUploading] = React.useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!sessionId) {
      alert("Please start a session first by sending a message.");
      return;
    }

    setUploading(true);
    onUploadStart();
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      let base64 = reader.result;
      if (base64.startsWith('data:')) {
        base64 = base64.split(',')[1];
      }
      
      try {
        const res = await sendImage(sessionId, "Analyzed this image.", base64);
        onUploadSuccess(res.data);
      } catch (err) {
        console.error(err);
        onUploadError(err);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = null; // Reset
  };

  return (
    <div className="relative pl-1">
      <input 
        type="file" 
        ref={fileInput} 
        onChange={handleFileChange}
        accept="image/jpeg, image/png, image/webp"
        className="hidden" 
      />
      <button 
        onClick={() => fileInput.current?.click()}
        disabled={uploading}
        className="p-2.5 rounded-full bg-white border border-slate-200 shadow-sm shadow-slate-200/50 text-slate-500 hover:bg-slate-50 hover:text-capblue transition-all flex items-center justify-center disabled:opacity-50"
        title="Upload Image (Invoice, Error Screen)"
      >
        {uploading ? <Loader2 size={18} className="animate-spin text-capblue" /> : <ImageIcon size={18} />}
      </button>
    </div>
  );
}
