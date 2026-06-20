import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaTimes, FaPaperPlane } from 'react-icons/fa';
import axios from 'axios';

export default function AIHeadhunter() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your AI Headhunter. Looking for a specific role? Need career advice? Ask me anything!" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const systemPrompt = `You are a highly premium, intelligent, and helpful AI Headhunter and Career Coach on a modern job portal. 
Be concise, enthusiastic, and provide extremely actionable advice. Do not output markdown, just plain text.`;

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/ai/chat`, {
        messages: newMessages,
        systemPrompt
      });

      setMessages([...newMessages, { role: 'assistant', content: res.data.reply }]);
    } catch (error) {
      setMessages([...newMessages, { role: 'assistant', content: "I'm currently offline or experiencing heavy load. Please try again later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9, filter: 'blur(10px)' }} 
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }} 
            exit={{ opacity: 0, y: 20, scale: 0.9, filter: 'blur(10px)' }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute bottom-24 right-0 w-[380px] sm:w-[420px] h-[600px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl border border-slate-200 dark:border-white/10 shadow-[0_0_80px_rgba(99,102,241,0.2)] rounded-[2.5rem] overflow-hidden flex flex-col z-[999998]"
          >
            {/* Ambient Background Glows */}
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />

            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between z-10 relative bg-slate-50/50 dark:bg-white/5 backdrop-blur-md">
               <div className="flex items-center gap-4">
                 <div className="relative">
                   <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)] border border-indigo-300 dark:border-white/20">
                     <FaRobot size={24} className="text-white" />
                   </div>
                   <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                 </div>
                 <div>
                   <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">AI Headhunter</h3>
                   <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 mt-1 uppercase tracking-widest opacity-80 flex items-center gap-1.5">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span> Online
                   </span>
                 </div>
               </div>
               <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:text-white/50 dark:hover:text-white transition-all w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 hover:rotate-90">
                 <FaTimes />
               </button>
            </div>

            {/* Chat Area */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 custom-scrollbar">
              {messages.map((msg, idx) => (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-3 mt-auto mb-1 shadow-lg shadow-indigo-500/20 flex-shrink-0">
                      <FaRobot size={12} className="text-white" />
                    </div>
                  )}
                  <div className={`max-w-[75%] rounded-3xl px-5 py-4 text-[15px] font-medium leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-br-sm shadow-[0_0_30px_rgba(0,0,0,0.1)]' 
                      : 'bg-white text-slate-700 border border-slate-200 dark:bg-white/10 dark:text-slate-200 dark:border-white/10 rounded-bl-sm backdrop-blur-md shadow-sm'
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start items-end">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-3 mb-1 shadow-lg shadow-indigo-500/20 flex-shrink-0">
                    <FaRobot size={12} className="text-white" />
                  </div>
                  <div className="bg-white border border-slate-200 dark:bg-white/10 dark:border-white/10 rounded-3xl rounded-bl-sm px-5 py-4 backdrop-blur-md flex items-center gap-2 shadow-sm">
                    <div className="w-2 h-2 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                    <div className="w-2 h-2 bg-pink-500 dark:bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 bg-slate-50/50 dark:bg-white/5 border-t border-slate-200 dark:border-white/10 relative z-10 backdrop-blur-md">
              <div className="relative flex items-center">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask for career advice..."
                  className="w-full bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-5 pr-16 text-[15px] font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all shadow-inner"
                  disabled={isTyping}
                />
                <button 
                  type="submit"
                  disabled={isTyping || !input.trim()}
                  className="absolute right-2 w-10 h-10 bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-50 disabled:bg-slate-200 dark:disabled:bg-white/20 disabled:text-slate-400 dark:disabled:text-white/50 rounded-xl flex items-center justify-center transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] disabled:shadow-none hover:-translate-y-0.5"
                >
                  <FaPaperPlane size={14} className="ml-0.5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-all duration-300 relative z-[999999] border border-slate-800 dark:border-slate-200"
      >
        <FaRobot size={26} className={`absolute transition-all duration-300 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`} />
        <FaTimes size={26} className={`absolute transition-all duration-300 ${isOpen ? 'scale-100 opacity-100 rotate-90' : 'scale-0 opacity-0 -rotate-90'}`} />
      </button>
    </div>
  );
}
