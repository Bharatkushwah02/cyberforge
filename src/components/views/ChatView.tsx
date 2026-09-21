import React, { FormEvent, useState } from 'react';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export function ChatView() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: 'I am the CyberForge security assistant. Ask me about the labs, defensive fixes, or secure coding.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    const nextMessages = [...messages, { role: 'user' as const, text }];
    setMessages(nextMessages);
    setInput('');
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Chat request failed');
      setMessages((current) => [...current, { role: 'model', text: result.text }]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to reach the AI service.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="max-w-5xl mx-auto space-y-6">
      <div className="border-b border-zinc-800 pb-5">
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-emerald-400">Gemini gateway</p>
        <h1 className="mt-2 text-3xl font-bold text-white">CyberForge AI Chat</h1>
        <p className="mt-2 text-sm text-zinc-400">Powered through a server-side Vercel function. The API key never reaches this browser.</p>
      </div>

      <div className="min-h-[420px] border border-zinc-800 bg-zinc-950 rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${message.role === 'user' ? 'bg-emerald-500 text-black' : 'bg-zinc-900 border border-zinc-800 text-zinc-200'}`}>
                <span className="block mb-1 text-[10px] font-mono uppercase opacity-60">{message.role === 'user' ? 'You' : 'CyberForge AI'}</span>
                {message.text}
              </div>
            </div>
          ))}
          {isLoading && <p className="text-xs font-mono text-emerald-400 animate-pulse">AI is thinking...</p>}
        </div>

        {error && <p className="border border-red-900 bg-red-950/30 rounded-xl px-3 py-2 text-sm text-red-300">{error}</p>}

        <form onSubmit={sendMessage} className="flex gap-3 border-t border-zinc-800 pt-4">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about a security lab or defensive fix..."
            className="min-w-0 flex-1 rounded-xl border border-zinc-700 bg-black px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !input.trim()} className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40">
            Send
          </button>
        </form>
      </div>
    </section>
  );
}
