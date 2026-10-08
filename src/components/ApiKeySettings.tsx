"use client";
import { useState, useEffect } from "react";

export default function ApiKeySettings() {
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const key = localStorage.getItem("groqApiKey");
    if (key) setApiKey(key);
  }, []);

  const saveKey = () => {
    localStorage.setItem("groqApiKey", apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-2xl p-5 shadow-sm mb-6 border border-zinc-100 dark:border-zinc-700">
      <h2 className="text-lg font-semibold mb-2">Advanced AI Settings</h2>
      <p className="text-sm text-zinc-500 mb-4">
        Enter your Groq API Key to enable the Llama 3 AI assistant.
      </p>
      <div className="flex gap-2">
        <input 
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="gsk_..." 
          className="border border-zinc-300 dark:border-zinc-600 rounded-xl px-4 py-2 bg-transparent flex-1"
        />
        <button onClick={saveKey} className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-2 rounded-xl font-medium shrink-0">
          {saved ? "Saved!" : "Save Key"}
        </button>
      </div>
      <p className="text-xs text-zinc-400 mt-2">
        Get a free API key from console.groq.com. It is stored securely on your device.
      </p>
    </div>
  );
}
