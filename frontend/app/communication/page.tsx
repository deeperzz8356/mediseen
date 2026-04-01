"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Send, User, Bot, Phone, Video, MoreHorizontal, Paperclip, Smile } from "lucide-react"
import { useLocale } from "../i18n/LocaleContext"

export default function CommunicationPage() {
  const { t } = useLocale()

  const initialMessages = [
    { id: 1, text: t.communication.initialMessages.msg1, sender: "bot", time: "10:15 AM" },
    { id: 2, text: t.communication.initialMessages.msg2, sender: "user", time: "10:18 AM" },
    { id: 3, text: t.communication.initialMessages.msg3, sender: "bot", time: "10:20 AM" },
  ]

  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState("")

  const handleSend = () => {
    if (!input.trim()) return
    const newMsg = { id: Date.now(), text: input, sender: "user", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    setMessages([...messages, newMsg])
    setInput("")
    
    setTimeout(() => {
      const reply = { id: Date.now() + 1, text: t.communication.initialMessages.autoReply, sender: "bot", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      setMessages(prev => [...prev, reply])
    }, 1500)
  }

  const contacts = [
    { name: t.communication.contacts.aiBot, last: t.communication.contacts.aiBotLast, active: true, icon: <Bot /> },
    { name: t.communication.contacts.radiologist, last: t.communication.contacts.radiologistLast, active: false, icon: <User /> },
    { name: t.communication.contacts.patient, last: t.communication.contacts.patientLast, active: false, icon: <User /> },
  ]

  return (
    <div className="max-w-6xl mx-auto px-6 h-[calc(100vh-140px)] flex gap-8">
      
      {/* Contact List (Desktop Mock) */}
      <div className="hidden lg:flex flex-col w-80 space-y-4">
        <h2 className="text-2xl font-black text-black px-4">{t.communication.consultations}</h2>
        <div className="space-y-2 overflow-y-auto">
          {contacts.map((contact, i) => (
            <div 
              key={i} 
              className={`p-4 rounded-[2rem] flex items-center gap-4 transition-all cursor-pointer ${
                contact.active ? "bg-white border border-slate-100 shadow-sm" : "hover:bg-slate-50/50"
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${contact.active ? "bg-pastel-violet" : "bg-slate-200"}`}>
                {contact.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-black truncate text-sm">{contact.name}</p>
                <p className="text-black/60 text-xs truncate font-bold">{contact.last}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white rounded-[3rem] shadow-xl shadow-black/[0.02] border border-slate-100 flex flex-col overflow-hidden relative">
        
        {/* Chat Header */}
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-pastel-violet flex items-center justify-center text-white">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-black">{t.communication.contacts.aiBot}</h3>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-[10px] font-black text-black uppercase tracking-widest">{t.communication.activeConsultant}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-3 rounded-2xl hover:bg-slate-50 text-black"><Phone className="w-5 h-5" /></button>
            <button className="p-3 rounded-2xl hover:bg-slate-50 text-black"><Video className="w-5 h-5" /></button>
            <button className="p-3 rounded-2xl hover:bg-slate-50 text-black"><MoreHorizontal className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Message View */}
        <div className="flex-1 overflow-y-auto p-10 space-y-8">
          {messages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] space-y-1`}>
                <div className={`p-6 rounded-[2rem] font-bold text-sm leading-relaxed ${
                  msg.sender === 'user' 
                    ? "bg-pastel-violet text-black rounded-tr-none shadow-lg shadow-pastel-violet/10" 
                    : "bg-slate-50 text-black rounded-tl-none border border-slate-100"
                }`}>
                  {msg.text}
                </div>
                <p className={`text-[10px] font-bold text-black ${msg.sender === 'user' ? 'text-right mr-2' : 'ml-2'}`}>
                  {msg.time}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-8">
          <div className="relative group">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-2 text-black/60">
               <button className="hover:text-pastel-violet transition-colors"><Paperclip className="w-5 h-5" /></button>
               <button className="hover:text-pastel-violet transition-colors"><Smile className="w-5 h-5" /></button>
            </div>
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t.communication.placeholder}
              className="w-full pl-24 pr-24 py-5 bg-slate-50 border border-slate-100 rounded-[2.5rem] focus:outline-none focus:ring-4 focus:ring-pastel-violet/5 focus:bg-white transition-all font-bold text-black shadow-inner"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim()}
              className="absolute right-3 top-3 bottom-3 px-8 bg-gradient-to-r from-pastel-pink to-pastel-violet rounded-full text-black font-black text-sm flex items-center gap-2 hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100 shadow-lg shadow-pastel-violet/20"
            >
              <span>{t.communication.send}</span>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  )
}
