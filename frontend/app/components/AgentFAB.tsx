"use client"

import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, X, Send, Sparkles, Brain } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useLocale } from "../i18n/LocaleContext"
import { auth } from "@/lib/firebase"
import { API_BASE_URL } from "../config"
import { useAppStore } from "../store/useAppStore"

export default function AgentFAB() {
  const { t } = useLocale()
  const { authStatus, profile } = useAppStore()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', text: t.agent.greeting }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Render message text as simple HTML to preserve newlines and basic lists.
  const escapeHtml = (unsafe: string) => {
    return unsafe
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
  }

  const formatMessageToHtml = (text: string) => {
    if (!text) return ''
    // Escape HTML first
    const escaped = escapeHtml(text)
    const lines = escaped.split(/\r?\n/)

    // Group consecutive bullet lines into <ul>
    const parts: string[] = []
    let inList = false
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.startsWith('- ')) {
        if (!inList) {
          parts.push('<ul>')
          inList = true
        }
        parts.push(`<li>${trimmed.slice(2)}</li>`)
      } else {
        if (inList) {
          parts.push('</ul>')
          inList = false
        }
        if (trimmed === '') {
          parts.push('<p></p>')
        } else {
          parts.push(`<p>${trimmed}</p>`)
        }
      }
    }
    if (inList) parts.push('</ul>')
    return parts.join('')
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  // Normalize any assistant messages that are JSON objects (or double-encoded JSON)
  useEffect(() => {
    setMessages(prev => {
      let changed = false
      const next = prev.map((m) => {
        if (m.role !== 'assistant' || typeof m.text !== 'string') return m
        const raw = m.text.trim()
        let parsed: any = null
        try {
          // Try direct parse
          if (raw.startsWith('{') || raw.startsWith('[') || raw.startsWith('"{')) {
            let candidate = raw
            if (candidate.startsWith('"') && candidate.endsWith('"')) {
              try { candidate = JSON.parse(candidate) } catch (_) {}
            }
            try {
              parsed = JSON.parse(candidate)
            } catch (_) {
              // fallback: try extracting a JSON substring inside the text
              const start = raw.indexOf('{')
              const end = raw.lastIndexOf('}')
              if (start >= 0 && end > start) {
                try {
                  parsed = JSON.parse(raw.slice(start, end + 1))
                } catch (_) {
                  parsed = null
                }
              }
            }
          } else {
            // also try to find embedded JSON anywhere in the text
            const start = raw.indexOf('{')
            const end = raw.lastIndexOf('}')
            if (start >= 0 && end > start) {
              try {
                parsed = JSON.parse(raw.slice(start, end + 1))
              } catch (_) {
                parsed = null
              }
            }
          }
        } catch (_) {
          // ignore parse errors
        }

        if (parsed && typeof parsed === 'object') {
          const candidate = parsed.response || parsed.text || parsed.message || parsed.body
          if (candidate && typeof candidate === 'string') {
            changed = true
            return { ...m, text: candidate }
          }
        }
        return m
      })
      return changed ? next : prev
    })
  }, [messages.length])

  const handleSend = async () => {
    if (!input.trim() || isTyping) return
    
    console.log("DEBUG: handleSend called with:", input)
    const userMessage = { role: 'user', text: input }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setIsTyping(true)

    try {
      let token = ""

      const user = auth?.currentUser
      if (user) {
        token = await user.getIdToken()
      } else if (authStatus === "guest" && profile?.uid) {
        token = profile.uid
      } else {
        throw new Error("Not authenticated")
      }

      // Format messages for OpenRouter (role + content)
      const apiMessages = newMessages.map(m => ({
        role: m.role,
        content: m.text
      }))

      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ messages: apiMessages })
      })

      if (!res.ok) {
        if (res.status === 404) throw new Error("The AI service is still being deployed. Please try again in 2 minutes.")
        const errorText = await res.text().catch(() => "")
        throw new Error(errorText || `Chat failed with status ${res.status}`)
      }

      if (!res.body) {
        throw new Error("Chat response stream was empty.")
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let started = false

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        if (!chunk) continue

        started = true
        setMessages((prev) => {
          const next = [...prev]
          const lastIndex = next.length - 1
          const lastMessage = next[lastIndex]

          if (lastMessage && lastMessage.role === 'assistant') {
            next[lastIndex] = { ...lastMessage, text: lastMessage.text + chunk }
          } else {
            next.push({ role: 'assistant', text: chunk })
          }

          return next
        })
      }

      if (!started) {
        setMessages(prev => [...prev, { role: 'assistant', text: "I'm sorry, I couldn't generate a reply." }])
      }

      // Post-process last assistant message: if it's JSON (e.g. {"response": "..."}), unwrap it.
      setMessages(prev => {
        const next = [...prev]
        const lastIndex = next.length - 1
        if (lastIndex < 0) return prev
        const last = next[lastIndex]
        if (!last || last.role !== 'assistant' || typeof last.text !== 'string') return prev
        let text = last.text.trim()
        // Try parsing JSON once or twice (for double-encoded strings)
        try {
          let parsed = JSON.parse(text)
          if (typeof parsed === 'string') {
            // double encoded
            try {
              parsed = JSON.parse(parsed)
            } catch (_) {
              // keep as string
            }
          }
          if (parsed && typeof parsed === 'object') {
            const candidate = parsed.response || parsed.text || parsed.message || parsed.body
            if (candidate && typeof candidate === 'string') {
              next[lastIndex] = { ...last, text: candidate }
              return next
            }
          }
        } catch (_) {
          // not JSON, nothing to do
        }
        return prev
      })
    } catch (err: unknown) {
      console.error("Chat error caught:", err)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: err instanceof Error ? err.message : "I'm sorry, I'm having trouble connecting right now. Please try again later." 
      }])
    } finally {
      setIsTyping(false)
    }
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
                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Clinical AI Studio</span>
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
                    {m.role === 'assistant' ? (
                      <div dangerouslySetInnerHTML={{ __html: formatMessageToHtml(m.text) }} />
                    ) : (
                      <>{m.text}</>
                    )}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100 flex gap-1">
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
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
