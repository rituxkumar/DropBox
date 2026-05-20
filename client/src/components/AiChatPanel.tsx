'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSend, FiLoader, FiMessageSquare } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import { aiService, ChatMessage } from '@/services/aiService';
import { FileData } from '@/services/fileService';

interface AiChatPanelProps {
  file: FileData | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AiChatPanel({ file, isOpen, onClose }: AiChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen && file) {
      loadHistory();
    }
  }, [isOpen, file]);

  const loadHistory = async () => {
    if (!file) return;
    setInitialLoading(true);
    try {
      const res = await aiService.getChatHistory(file._id);
      if (res.data && res.data.length > 0) {
        setMessages(res.data);
      } else {
        setMessages([
          {
            role: 'model',
            text: `Hi! I've read **${file.fileName}**. What would you like to know about it?`,
          },
        ]);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load chat history');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !file || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const res = await aiService.chatWithFile(file._id, userMessage);
      setMessages((prev) => [...prev, res.data]);
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.message || 'Failed to get AI response';
      toast.error(errMsg);
      // Remove the optimistic user message if failed, or add an error message
      setMessages((prev) => [...prev, { role: 'model', text: `*Error: ${errMsg}*` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedClick = (q: string) => {
    setInput(q);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex justify-end bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full max-w-md h-full bg-surface border-l border-border flex flex-col shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-surface-light">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                <FiMessageSquare className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-foreground">Gemini AI</h3>
                <p className="text-xs text-muted truncate">Talking to: {file?.fileName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-surface-hover text-muted hover:text-foreground transition-colors cursor-pointer shrink-0"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {initialLoading ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <p className="text-sm text-muted animate-pulse">Reading document...</p>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 ${
                        msg.role === 'user'
                          ? 'bg-primary text-white rounded-tr-sm'
                          : 'bg-surface-light border border-border text-foreground rounded-tl-sm'
                      }`}
                    >
                      {msg.role === 'model' ? (
                        <div className="prose prose-sm prose-invert max-w-none">
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                      )}
                    </div>
                  </div>
                ))}
                
                {loading && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl p-4 bg-surface-light border border-border rounded-tl-sm flex items-center gap-2">
                      <FiLoader className="w-4 h-4 text-primary animate-spin" />
                      <span className="text-sm text-muted">Gemini is thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Suggested Questions */}
          {!initialLoading && messages.length <= 1 && (
             <div className="px-4 pb-2 flex flex-wrap gap-2">
                <button onClick={() => handleSuggestedClick('Summarize this document')} className="px-3 py-1.5 rounded-lg bg-surface-hover text-xs text-muted hover:text-foreground border border-transparent hover:border-border transition-all cursor-pointer">Summarize</button>
                <button onClick={() => handleSuggestedClick('What are the key takeaways?')} className="px-3 py-1.5 rounded-lg bg-surface-hover text-xs text-muted hover:text-foreground border border-transparent hover:border-border transition-all cursor-pointer">Key takeaways</button>
                <button onClick={() => handleSuggestedClick('Explain this simply')} className="px-3 py-1.5 rounded-lg bg-surface-hover text-xs text-muted hover:text-foreground border border-transparent hover:border-border transition-all cursor-pointer">Explain simply</button>
             </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-border bg-surface">
            <form onSubmit={handleSend} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about this file..."
                className="w-full pl-4 pr-12 py-3 rounded-xl bg-surface-light border border-border text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                disabled={loading || initialLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading || initialLoading}
                className="absolute right-2 p-2 rounded-lg bg-primary hover:bg-primary-hover disabled:bg-surface-hover disabled:text-muted text-white transition-colors cursor-pointer flex items-center justify-center"
              >
                <FiSend className="w-4 h-4" />
              </button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
