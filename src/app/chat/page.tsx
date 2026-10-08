"use client";

import { useState, useRef, useEffect } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState<{role: 'user'|'assistant', text: string}[]>([
    { role: 'assistant', text: "Hi! I'm your advanced AI Secretary. I'm connected to Google Search and your personal profile. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Your browser does not support Voice Recognition.");
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      setInput(event.results[0][0].transcript);
    };
    recognition.onerror = (event: any) => {
      console.error("Speech error", event.error);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[\u{1F600}-\u{1F6FF}]/gu, '').replace(/\*/g, '').replace(/#/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const apiKey = localStorage.getItem("groqApiKey");
    if (!apiKey) {
      alert("Please set your Groq API Key in the Profile page first!");
      return;
    }

    const userMessage = input;
    setInput("");
    const newHistory = [...messages, { role: 'user' as const, text: userMessage }];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const apiHistory = newHistory.slice(1, -1).map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, history: apiHistory, apiKey })
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessages(prev => [...prev, { role: 'assistant', text: data.response }]);
        speakText(data.response);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', text: `Error: ${data.error}` }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: "Failed to connect to AI." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-white dark:bg-zinc-950 pb-safe">
      
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
        <h1 className="text-xl font-bold">AI Assistant</h1>
        {isSpeaking && (
          <button onClick={stopSpeaking} className="text-sm bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-3 py-1 rounded-full font-medium">
            Stop Audio 🛑
          </button>
        )}
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-20 lg:px-40 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 mt-1">✨</div>
            )}
            <div className={`max-w-[85%] md:max-w-[75%] px-5 py-4 rounded-2xl text-[15px] leading-relaxed whitespace-pre-wrap ${
              msg.role === 'user' 
                ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white rounded-br-sm' 
                : 'text-black dark:text-zinc-200'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4 justify-start">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 mt-1">✨</div>
            <div className="px-5 py-4 flex gap-1 items-center">
              <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce delay-100"></span>
              <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce delay-200"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 md:px-20 lg:px-40 bg-gradient-to-t from-white via-white to-transparent dark:from-zinc-950 dark:via-zinc-950 shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-2 bg-zinc-100 dark:bg-zinc-900 rounded-3xl p-2 border border-zinc-200 dark:border-zinc-800 shadow-sm focus-within:ring-2 ring-blue-500/20 transition-all">
          <button 
            type="button"
            onClick={startListening}
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
              isListening ? 'bg-red-500 text-white animate-pulse' : 'text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
          >
            🎤
          </button>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={isListening ? "Listening..." : "Message AI Secretary..."}
            className="flex-1 bg-transparent px-2 py-2 text-[15px] focus:outline-none"
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ↑
          </button>
        </form>
        <p className="text-center text-xs text-zinc-400 mt-3 mb-1">
          AI can make mistakes. Check important info.
        </p>
      </div>

    </div>
  );
}
