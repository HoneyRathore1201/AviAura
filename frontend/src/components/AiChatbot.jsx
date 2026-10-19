import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api/client'

const quickChips = [
  '🌱 Pure veg recommendations',
  '🏨 Curated boutique stays',
  '💰 Budget transport options',
  '🎒 Smart packing essentials',
]

export default function AiChatbot({ currentDestination = '' }) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const activeDestination = useMemo(() => {
    if (currentDestination) return currentDestination
    try {
      const raw = sessionStorage.getItem('aviaura_last_trip')
      return raw ? JSON.parse(raw).destination : ''
    } catch {
      return ''
    }
  }, [currentDestination])

  const [messages, setMessages] = useState([
    {
      role: 'model',
      content:
        'Hello! I am AURA AI, your personal travel concierge. Ask me about verified hotels, pure-veg or local food gems, route pacing, or packing advice.',
    },
  ])

  const chatEndRef = useRef(null)

  useEffect(() => {
    if (open) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, open])

  async function handleSend(textToSend) {
    const text = textToSend || input
    if (!text.trim() || loading) return

    const newMessages = [...messages, { role: 'user', content: text.trim() }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const payload = {
        messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        destination: activeDestination || undefined,
      }
      const { data } = await api.post('/api/chat', payload)
      setMessages([...newMessages, { role: 'model', content: data.reply }])
    } catch {
      setMessages([
        ...newMessages,
        {
          role: 'model',
          content: 'AURA AI is experiencing a brief connection delay. Please try again shortly.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.25 }}
            className="mb-4 flex h-[480px] w-96 flex-col overflow-hidden rounded-3xl border border-white/10 glass-card shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] bg-slate-900/60 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-base">
                  ✦
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-white flex items-center gap-1.5">
                    <span>AURA AI</span>
                    <span className="badge-gold text-[9px] font-semibold px-1.5 py-0.2 rounded">CONCIERGE</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {activeDestination ? `Context: ${activeDestination}` : 'Signature Travel Concierge'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-white/[0.08] hover:text-white transition"
              >
                ✕
              </button>
            </div>

            {/* Message List */}
            <div className="flex-1 space-y-3 overflow-y-auto p-4 text-xs">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-amber-500 text-slate-950 font-medium'
                        : 'border border-white/[0.08] bg-slate-900/80 text-slate-200'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-white/[0.08] bg-slate-900/80 px-4 py-2 text-slate-400 animate-pulse">
                    AURA AI is thinking…
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Chips */}
            <div className="flex gap-1.5 overflow-x-auto border-t border-white/[0.06] bg-slate-900/40 px-3 py-2">
              {quickChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleSend(chip)}
                  disabled={loading}
                  className="shrink-0 rounded-full border border-slate-700/60 bg-slate-800/60 px-2.5 py-1 text-[11px] text-slate-300 hover:border-amber-400/50 hover:text-white transition cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex items-center gap-2 border-t border-white/[0.08] bg-slate-900/70 p-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask AURA AI about dining, stays, timing…"
                className="flex-1 rounded-xl border border-slate-700/80 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="btn-primary flex h-8 w-8 items-center justify-center rounded-xl text-slate-950 font-bold disabled:opacity-40 cursor-pointer"
              >
                ↑
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launcher Button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((o) => !o)}
        className="btn-primary flex items-center gap-2.5 rounded-full px-4 py-3 shadow-xl cursor-pointer"
      >
        <span className="flex h-2.5 w-2.5 rounded-full bg-slate-950 animate-pulse" />
        <span className="font-display text-xs font-bold text-slate-950">Ask AURA AI</span>
      </motion.button>
    </div>
  )
}
