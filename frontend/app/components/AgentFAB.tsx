"use client"

import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, X, Send, Sparkles, Brain } from "lucide-react"
import { useState } from "react"
import { useLocale } from "../i18n/LocaleContext"

export default function AgentFAB() {
  const { t } = useLocale()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', text: t.agent.greeting }
  ])
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim()) return
    setMessages([...messages, { role: 'user', text: input }])
    setInput('')
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', text: t.agent.analyzing }])
    }, 1000)
  }

  return (
    <div className="fixed right-4 bottom-[calc(env(safe-area-inset-bottom)+5.75rem)] sm:right-8 sm:bottom-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-[calc(100vw-2rem)] sm:w-[400px] max-w-[400px] h-[70vh] max-h-[550px] bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-pastel-pink/10 to-pastel-violet/10 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pastel-pink to-pastel-violet flex items-center justify-center text-white shadow-md">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-sm">{t.agent.title}</h3>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">{t.agent.activeModel}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl bg-white/50 text-slate-400 hover:text-slate-600 transition shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-4 rounded-2xl font-semibold text-sm shadow-sm
                    ${m.role === 'user' 
                      ? 'bg-pastel-violet text-white rounded-tr-none' 
                      : 'bg-slate-50 text-slate-600 rounded-tl-none border border-slate-100'
                    }
                  `}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Input */}
            <div className="p-6 bg-white border-t border-slate-50">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={t.agent.placeholder}
                  className="w-full pl-6 pr-14 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-pastel-violet/50 font-semibold text-sm placeholder-slate-400 transition-all shadow-inner"
                />
                <button 
                  onClick={handleSend}
                  className="absolute right-2 top-2 w-10 h-10 rounded-xl bg-pastel-violet text-white flex items-center justify-center shadow-lg shadow-pastel-violet/20 hover:scale-105 active:scale-95 transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-r from-pastel-pink to-pastel-violet text-white flex items-center justify-center shadow-2xl shadow-pastel-violet/40 relative z-[100]"
      >
        {isOpen ? <X className="w-8 h-8" /> : <MessageSquare className="w-8 h-8" />}
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md">
          <Sparkles className="w-3 h-3 text-pastel-violet animate-pulse" />
        </div>
      </motion.button>
    </div>
  )
}
