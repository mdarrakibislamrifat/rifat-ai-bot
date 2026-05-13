"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2, Globe, MessageSquareQuote } from "lucide-react";

export default function CreateChatbotModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const payload = {
      name: formData.get("name"),
      url: formData.get("url"),
      displayName: formData.get("name"),
    };

    try {
      const res = await fetch("/api/chatbot/create", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const { chatbotId } = await res.json();

      fetch("/api/ingest", {
        method: "POST",
        body: JSON.stringify({ url: payload.url, chatbotId }),
      });

      setIsOpen(false);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return (
    <button 
      onClick={() => setIsOpen(true)} 
      className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-500 font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-95"
    >
      <Plus size={20} /> New Chatbot
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-9999 flex items-center justify-center p-4">

      <div className="bg-[#121214] w-full max-w-md rounded-4xl p-8 relative shadow-2xl border border-white/10 ring-1 ring-white/5">
        
        <button 
          onClick={() => setIsOpen(false)} 
          className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
        >
          <X size={20} />
        </button>
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Build New Bot</h2>
          <p className="text-zinc-400 text-sm">Train your AI by connecting your website.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Assistant Name</label>
            <div className="relative">
              <MessageSquareQuote className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                name="name" 
                required 
                placeholder="My Sales Bot" 
                className="w-full pl-12 pr-5 py-4 bg-zinc-900/50 text-white rounded-2xl border border-white/5 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-zinc-600" 
              />
            </div>
          </div>

          {/* Website URL Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Website Source</label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                name="url" 
                type="url" 
                required 
                placeholder="https://your-site.com" 
                className="w-full pl-12 pr-5 py-4 bg-zinc-900/50 text-white rounded-2xl border border-white/5 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-zinc-600" 
              />
            </div>
          </div>

          <button 
            disabled={loading} 
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Analyzing Site...</span>
              </>
            ) : (
              "Create & Start Training"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}