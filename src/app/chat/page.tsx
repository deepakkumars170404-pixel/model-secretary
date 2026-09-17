"use client";

import { useState } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', text: string}[]>([
    { role: 'assistant', text: 'Hi! I am your AI Personal Secretary. How can I help with your modeling or health journey today?' }
  ]);
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const newMsgs = [...messages, { role: 'user' as const, text: input }];
    setMessages(newMsgs);
    setInput("");

    // Mock AI response for now
    setTimeout(() => {
      setMessages([...newMsgs, { 
        role: 'assistant', 
        text: 'That sounds great! I am currently running in local mode, but once you connect my AI brain, I will be able to give you specific suggestions for that!' 
      }]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-lg mx-auto">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900 sticky top-0 z-10">
        <h1 className="text-xl font-bold">AI Assistant 🤖</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm/relaxed ${
              msg.role === 'user' 
                ? 'bg-blue-500 text-white rounded-br-none' 
                : 'bg-zinc-100 dark:bg-zinc-800 rounded-bl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about your diet, outfit, etc..."
            className="flex-1 border border-zinc-300 dark:border-zinc-600 rounded-full px-4 py-2 bg-transparent"
          />
          <button type="submit" className="bg-blue-500 text-white rounded-full p-2 h-10 w-10 flex items-center justify-center shrink-0">
            ↑
          </button>
        </form>
      </div>
    </div>
  );
}
