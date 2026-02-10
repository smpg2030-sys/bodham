import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Phone, Video, MessageCircle, MoreVertical, ArrowLeft, Check, CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TherapistSupportScreen() {
  const navigate = useNavigate();
  const [connecting, setConnecting] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Array<{ id: number, text: string, sender: 'therapist' | 'user', type?: 'text' | 'options', timestamp: string }>>([]);
  const [showOptions, setShowOptions] = useState(false);

  const therapist = {
    name: "Manikanta",
    title: "Crisis Counselor",
    avatar: "👨‍⚕️",
    status: "Online"
  };

  useEffect(() => {
    // Simulate connection and initial message
    const t1 = setTimeout(() => {
      setConnecting(false);
      setMessages([
        { id: 1, text: "Hi, I'm Manikanta. I'm here to support you.", sender: 'therapist', type: 'text', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
    }, 2000);

    const t2 = setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { id: 2, text: "How would you like to connect today?", sender: 'therapist', type: 'text', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
      setShowOptions(true);
    }, 3500);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleOptionClick = (option: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { id: Date.now(), text: `I'd like to use ${option}`, sender: 'user', type: 'text', timestamp: time }]);
    setShowOptions(false);

    // Simulate response delay
    setTimeout(() => {
      let responseText = "";
      if (option === "WhatsApp") responseText = "Opening WhatsApp for you...";
      if (option === "Call") responseText = "Calling you now...";
      if (option === "Video") responseText = "Setting up secure video room...";

      setMessages(prev => [...prev, { id: Date.now() + 1, text: responseText, sender: 'therapist', type: 'text', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);

      // Perform action
      setTimeout(() => {
        if (option === "WhatsApp") window.open("https://wa.me/919398789351?text=Hello,%20I%20need%20immediate%20support.", "_blank");
        if (option === "Call") window.location.href = "tel:9398789351";
      }, 1500);
    }, 1000);
  };

  if (connecting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface-50">
        <div className="relative">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-4xl animate-pulse">
            {therapist.avatar}
          </div>
          <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full shadow-sm">
            <div className="w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-bounce"></div>
          </div>
        </div>
        <h2 className="mt-6 text-xl font-bold text-slate-800">Connecting securely...</h2>
        <p className="text-slate-500 text-sm mt-2">Finding available counselor</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-surface-50">
      {/* Header - Google Messages Style */}
      <div className="bg-white px-4 py-3 flex items-center justify-between shadow-sm border-b border-slate-100 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="relative">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-xl">
              {therapist.avatar}
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-base leading-tight">{therapist.name}</h1>
            <p className="text-xs text-emerald-600 font-medium">{therapist.status} • {therapist.title}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 text-slate-600 hover:bg-slate-50 rounded-full">
            <Video className="w-6 h-6" />
          </button>
          <button className="p-2 text-slate-600 hover:bg-slate-50 rounded-full">
            <Phone className="w-6 h-6" />
          </button>
          <button className="p-2 text-slate-600 hover:bg-slate-50 rounded-full">
            <MoreVertical className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
        <div className="text-center text-xs text-slate-400 my-4 uppercase tracking-widest font-bold">
          Today
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-800 text-center mx-4 mb-6">
          🔒 Messages are end-to-end encrypted. No one outside of this chat, not even MindRise, can read or listen to them.
        </div>

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-5 py-3 shadow-sm text-[15px] leading-relaxed relative group ${msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-none'
                    : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                  }`}
              >
                {msg.text}
                <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${msg.sender === 'user' ? 'text-emerald-100' : 'text-slate-400'}`}>
                  {msg.timestamp}
                  {msg.sender === 'user' && <CheckCheck className="w-3 h-3" />}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {showOptions && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2 justify-center mt-4"
          >
            <button onClick={() => handleOptionClick("Call")} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 font-medium text-sm hover:bg-emerald-100 transition">
              <Phone className="w-4 h-4" /> Voice Call
            </button>
            <button onClick={() => handleOptionClick("WhatsApp")} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 font-medium text-sm hover:bg-emerald-100 transition">
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </button>
            <button onClick={() => handleOptionClick("Video")} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 font-medium text-sm hover:bg-emerald-100 transition">
              <Video className="w-4 h-4" /> Video Call
            </button>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-3">
        <button className="p-2 bg-slate-100 rounded-full text-slate-500 hover:text-emerald-600 transition">
          <span className="text-xl">😊</span>
        </button>
        <div className="flex-1 bg-slate-50 rounded-full border border-slate-200 px-4 py-3 text-slate-400 text-sm cursor-not-allowed">
          Reply using options above...
        </div>
        <button className="p-3 bg-emerald-600 rounded-full text-white shadow-lg shadow-emerald-200 hover:scale-105 active:scale-95 transition">
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

