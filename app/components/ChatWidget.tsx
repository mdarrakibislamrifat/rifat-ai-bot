'use client'
import { useState, useRef, useEffect } from 'react'
import { Send, Bot, X, MessageCircle, MoreHorizontal } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ChatWidget({ chatbotId }: { chatbotId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<{ role: string, text: string }[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const handleSend = async () => {
    if (!input.trim()) return
    
    const userMsg = { role: 'user', text: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, chatbotId })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', text: data.text }])
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I'm having trouble connecting." }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`${isOpen ? 'bg-gray-800' : 'bg-blue-600'} p-4 rounded-full text-white shadow-2xl transition-colors duration-300`}
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-20 right-0 w-[380px] sm:w-[420px] h-[600px] bg-white border border-gray-100 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden"
          >
            {/* Header - Gradient & Professional */}
            <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                    <Bot size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Your AI Assistant</h3>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      <span className="text-white/70 text-[11px] uppercase font-medium tracking-widest">Active Now</span>
                    </div>
                  </div>
                </div>
                <MoreHorizontal size={20} className="text-white/60 cursor-pointer" />
              </div>
            </div>

            {/* Message Area */}
            <div ref={scrollRef} className="flex-1 p-5 overflow-y-auto bg-[#F8FAFC] space-y-4 custom-scrollbar">
              {messages.length === 0 && (
                <div className="text-center mt-10 space-y-2">
                  <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-blue-600">
                    <Bot size={24} />
                  </div>
                  <p className="text-gray-500 text-sm">Hello! How can I help you today?</p>
                </div>
              )}
              
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white text-gray-800 border border-gray-200/50 rounded-bl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-bl-none shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Footer */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex items-center gap-2 bg-gray-100 rounded-2xl p-1 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 transition-all duration-200">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent border-none py-3 px-4 text-sm outline-none text-gray-700" 
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-transform active:scale-95"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-3 tracking-tight">
                Secure AI Chat powered by <span className="font-semibold">Rifat</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}