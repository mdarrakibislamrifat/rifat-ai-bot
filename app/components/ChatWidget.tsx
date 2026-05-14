"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, X, MessageCircle, MoreHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatWidget({
  chatbotId,
  isEmbed = false,
}: {
  chatbotId: string;
  isEmbed?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(isEmbed ? true : false);
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, chatbotId }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", text: data.text }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Sorry, I'm having trouble connecting." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const chatWindow = (
    <div
      className={
        isEmbed
          ? "w-full h-full flex flex-col bg-[#fafafa]"
          : "absolute bottom-20 right-0 w-[360px] sm:w-[400px] h-[580px] flex flex-col bg-[#fafafa] rounded-2xl border border-[#e8e8e8] shadow-[0_8px_40px_rgba(0,0,0,0.10)] overflow-hidden"
      }
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-white border-b border-[#ebebeb]">
        <div className="flex items-center gap-3">
          <div className="w-[34px] h-[34px] bg-[#f2f2f2] rounded-[9px] flex items-center justify-center">
            <Bot size={16} strokeWidth={1.5} className="text-[#999]" />
          </div>
          <div>
            <p className="text-[13.5px] font-semibold text-[#111] tracking-[-0.01em] leading-none mb-1">
              Your AI Assistant
            </p>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-[5px] w-[5px]">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-50" />
                <span className="relative inline-flex rounded-full h-[5px] w-[5px] bg-green-500" />
              </span>
              <span className="text-[10px] font-medium tracking-[0.07em] uppercase text-[#b0b0b0]">
                Active now
              </span>
            </div>
          </div>
        </div>
        <button className="w-7 h-7 flex items-center justify-center rounded-lg text-[#ccc] hover:text-[#888] hover:bg-[#f4f4f4] transition-all duration-150">
          <MoreHorizontal size={16} strokeWidth={2} />
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-5 space-y-3"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#e5e5e5 transparent" }}
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-[#ccc]">
            <div className="w-10 h-10 bg-[#f0f0f0] rounded-full flex items-center justify-center">
              <Bot size={18} strokeWidth={1.5} className="text-[#c0c0c0]" />
            </div>
            <p className="text-[13px] text-[#c0c0c0]">Hello! How can I help you today?</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[78%] px-3.5 py-2.5 text-[13.5px] leading-[1.55] rounded-2xl ${
                msg.role === "user"
                  ? "bg-[#111] text-white rounded-br-[3px]"
                  : "bg-white text-[#222] border border-[#ebebeb] rounded-bl-[3px]"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-[#ebebeb] rounded-2xl rounded-bl-[3px] px-3.5 py-3">
              <div className="flex gap-1">
                {[0, 0.2, 0.4].map((delay, i) => (
                  <span
                    key={i}
                    className="w-[5px] h-[5px] bg-[#d0d0d0] rounded-full animate-bounce"
                    style={{ animationDelay: `${delay}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Footer */}
      <div className="px-3.5 py-3 bg-white border-t border-[#ebebeb]">
        <div className="flex items-center gap-2 bg-[#f5f5f5] rounded-xl px-3.5 py-1.5 border border-transparent focus-within:bg-white focus-within:border-[#e0e0e0] focus-within:shadow-[0_0_0_3px_rgba(0,0,0,0.04)] transition-all duration-200">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message…"
            className="flex-1 bg-transparent border-none outline-none text-[13.5px] text-[#222] placeholder:text-[#c0c0c0] py-2 font-sans"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-8 h-8 bg-[#111] text-white rounded-[8px] flex items-center justify-center flex-shrink-0 hover:bg-[#333] active:scale-95 disabled:bg-[#e5e5e5] disabled:cursor-not-allowed transition-all duration-150"
          >
            <Send size={14} strokeWidth={2} className="disabled:text-[#bbb]" />
          </button>
        </div>
        <p className="text-[10px] text-[#ccc] text-center mt-2.5 tracking-tight">
          Secure AI Chat powered by <span className="text-[#aaa] font-medium">Rifat</span>
        </p>
      </div>
    </div>
  );

  if (isEmbed) return <div className="w-full h-screen font-sans">{chatWindow}</div>;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-[0_4px_24px_rgba(0,0,0,0.18)] transition-colors duration-200 ${
          isOpen ? "bg-[#222]" : "bg-[#111]"
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X size={22} strokeWidth={2} />
            </motion.span>
          ) : (
            <motion.span key="msg" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle size={22} strokeWidth={1.8} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {chatWindow}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}