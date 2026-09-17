"use client";

import { useState, useRef, useEffect } from "react";

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user'|'assistant', text: string}[]>([
    { role: 'assistant', text: "Hi! I'm your advanced AI Secretary. I am connected to Google Search and your personal profile. Ask me anything!" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Audio synthesis state
  const [isSpeaking, setIsSpeaking] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Handle Speech to Text
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

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      // Optional: automatically send when speech stops
      // handleSubmitWithInput(transcript); 
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Handle Text to Speech
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    // Remove emojis and markdown formatting before speaking
    const cleanText = text.replace(/[\u{1F600}-\u{1F6FF}]/gu, '').replace(/\*/g, '').replace(/#/g, '');
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    
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

    const apiKey = localStorage.getItem("geminiApiKey");
    if (!apiKey) {
      alert("Please set your Gemini API Key in the Profile page first!");
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
        body: JSON.stringify({
          message: userMessage,
          history: apiHistory,
          apiKey
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessages(prev => [...prev, { role: 'assistant', text: data.response }]);
        // Automatically speak the response
        speakText(data.response);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', text: `Error: ${data.error}` }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: "Failed to reach AI. Check your internet connection." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-6 bg-blue-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-3xl z-50 hover:bg-blue-700 transition-transform hover:scale-110"
      >
        ✨
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-36 right-6 w-80 sm:w-96 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden transition-all max-h-[60vh] h-[500px]">
          <div className="bg-blue-600 text-white p-4 font-bold flex justify-between items-center">
            <span>Advanced AI Secretary</span>
            <div className="flex gap-3">
              {isSpeaking && (
                <button onClick={stopSpeaking} className="text-white hover:text-red-200 text-sm bg-black/20 px-2 py-1 rounded-full">
                  🛑 Stop Audio
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="text-white hover:text-blue-200">✕</button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm/relaxed whitespace-pre-wrap ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-zinc-100 rounded-bl-none shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl rounded-bl-none px-4 py-3 text-sm flex gap-1">
                  <span className="animate-bounce">.</span><span className="animate-bounce delay-100">.</span><span className="animate-bounce delay-200">.</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-3 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex gap-2">
            <button 
              type="button"
              onClick={startListening}
              className={`rounded-full w-10 h-10 flex items-center justify-center shrink-0 transition-colors ${
                isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
              }`}
              title="Speak"
            >
              🎤
            </button>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={isListening ? "Listening..." : "Ask anything..."}
              className="flex-1 border border-zinc-300 dark:border-zinc-700 rounded-full px-4 py-2 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:border-blue-500"
            />
            <button 
              type="submit" 
              disabled={isLoading}
              className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center shrink-0 disabled:opacity-50"
            >
              ↑
            </button>
          </form>
        </div>
      )}
    </>
  );
}
