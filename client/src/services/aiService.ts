import api from '../lib/axios';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp?: string;
}

export const aiService = {
  chatWithFile: async (fileId: string, message: string) => {
    const response = await api.post(`/api/ai/chat/${fileId}`, { message });
    return response.data;
  },

  getChatHistory: async (fileId: string) => {
    const response = await api.get(`/api/ai/history/${fileId}`);
    return response.data;
  },
};
