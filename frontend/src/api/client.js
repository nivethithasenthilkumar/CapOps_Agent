import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:80/api';

const client = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const sendMessage = async (data) => {
  return client.post('/chat', data);
};

export const sendVoice = async (sessionId, voiceText) => {
  const formData = new FormData();
  formData.append('session_id', sessionId);
  formData.append('voice_text', voiceText);
  return client.post('/chat/voice', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const sendImage = async (sessionId, message, base64Image) => {
  const formData = new FormData();
  formData.append('session_id', sessionId);
  formData.append('message', message);
  formData.append('image_base64', base64Image);
  return client.post('/chat/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const clearSession = async (sessionId) => {
  return client.delete(`/session/${sessionId}`);
};

export const getHistory = async (sessionId) => {
  return client.get(`/session/${sessionId}/history`);
};

export const getStats = async () => {
  return client.get('/dashboard/stats');
};

export const escalate = async (sessionId) => {
  return client.post('/escalate', { session_id: sessionId, message: "Escalation requested" });
};

export const submitFeedback = async (sessionId, messageId, rating) => {
  return client.post('/feedback', { session_id: sessionId, message_id: messageId, rating });
};

export const predict = async (sessionId) => {
  return client.get(`/predict/${sessionId}`);
};

export const getContentGaps = async () => {
  return client.get('/gaps/content');
};
