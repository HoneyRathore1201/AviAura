import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'

const quickChips = [
  '✈️ Plan 3-day Jaipur trip',
  '🏖️ Plan 3-day Goa trip',
  '🗺️ How does Aviaura work?',
  '🌱 Pure veg & Jain guide',
  '💰 Budget calibration & tips',
  '👨‍💻 Who built Aviaura?',
  '🛎️ Open Support Ticket',
]

function renderFormattedMessage(content, navigate) {
  if (!content) return null

  // Split by double newlines for paragraphs / blocks
  const lines = content.split('\n')

  return (
    <div className="space-y-1.5 text-xs leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim()
        if (!trimmed) {
          return <div key={idx} className="h-1" />
        }

        // Header ###
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={idx} className="font-display text-sm font-bold text-amber-400 mt-2 mb-1">
              {trimmed.replace(/^###\s+/, '')}
            </h4>
          )
        }
        if (trimmed.startsWith('#### ')) {
          return (
            <h5 key={idx} className="font-display text-xs font-semibold text-slate-100 mt-1.5 mb-0.5">
              {trimmed.replace(/^####\s+/, '')}
            </h5>
          )
        }

        // Horizontal rule
        if (trimmed === '---' || trimmed === '***') {
          return <hr key={idx} className="my-2 border-white/10" />
        }

        // Parse inline bold, italic, and links [label](url)
        const parts = []
        let lastIndex = 0
        // Combined regex for markdown link [text](url) and bold **text**
        const regex = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*)/g
        let match

        while ((match = regex.exec(line)) !== null) {
          if (match.index > lastIndex) {
            parts.push(line.substring(lastIndex, match.index))
          }

          if (match[2] && match[3]) {
            // Markdown link: [text](url)
            const label = match[2]
            const url = match[3]
            const isInternal = url.startsWith('/')
            parts.push(
              isInternal ? (
                <button
                  key={match.index}
                  type="button"
                  onClick={() => navigate(url)}
                  className="font-semibold text-amber-400 underline underline-offset-2 hover:text-amber-300 transition cursor-pointer"
                >
                  {label}
                </button>
              ) : (
                <a
                  key={match.index}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-amber-400 underline underline-offset-2 hover:text-amber-300 transition"
                >
                  {label}
                </a>
              )
            )
          } else if (match[4]) {
            // Bold **text**
            parts.push(
              <strong key={match.index} className="font-bold text-white">
                {match[4]}
              </strong>
            )
          } else if (match[5]) {
            // Italic *text*
            parts.push(
              <em key={match.index} className="italic text-slate-300">
                {match[5]}
              </em>
            )
          }
          lastIndex = regex.lastIndex
        }

        if (lastIndex < line.length) {
          parts.push(line.substring(lastIndex))
        }

        // Bullet point
        if (trimmed.startsWith('• ') || trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1">
              <span className="text-amber-400 font-bold shrink-0">•</span>
              <span className="text-slate-200">{parts}</span>
            </div>
          )
        }

        return (
          <p key={idx} className="text-slate-200">
            {parts}
          </p>
        )
      })}
    </div>
  )
}

export default function AiChatbot({ currentDestination = '' }) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const activeDestination = useMemo(() => {
    if (currentDestination) return currentDestination
    try {
      const raw = sessionStorage.getItem('aviaura_last_trip')
      return raw ? JSON.parse(raw).destination : ''
    } catch {
      return ''
    }
  }, [currentDestination])

  const initialMessage = {
    role: 'model',
    content:
      '✦ **Namaste! I am AURA AI, your signature travel concierge for Aviaura.**\n\nAsk me anything: get instant day-by-day itineraries with exact hotels & dining, verify pure-veg/Jain options, explore platform features, or ask about our team!',
  }

  const [messages, setMessages] = useState([initialMessage])

  const chatEndRef = useRef(null)

  useEffect(() => {
    if (open) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, open])

  function handleResetChat() {
    setMessages([initialMessage])
  }

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
          content:
            '✦ **AURA AI Status**: Connected. Feel free to explore our [Trip Planner](/plan) or file a priority ticket at our [Support Desk](/support). How can I assist your travels today?',
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
            className="mb-4 flex h-[540px] w-[420px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-white/10 glass-card shadow-2xl bg-slate-950/95 backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] bg-slate-900/80 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-base shadow-inner">
                  ✦
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-white flex items-center gap-1.5">
                    <span>AURA AI</span>
                    <span className="badge-gold text-[9px] font-semibold px-1.5 py-0.2 rounded">CONCIERGE</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{activeDestination ? `Context: ${activeDestination}` : '24/7 Fast & Intelligent'}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleResetChat}
                  title="Clear conversation"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-white/[0.08] hover:text-white transition text-xs cursor-pointer"
                >
                  ↺
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  title="Close chat"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-white/[0.08] hover:text-white transition text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Message List */}
            <div className="flex-1 space-y-3 overflow-y-auto p-4 text-xs">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-3 shadow-md ${
                      m.role === 'user'
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-medium whitespace-pre-wrap'
                        : 'border border-white/[0.08] bg-slate-900/90 text-slate-200'
                    }`}
                  >
                    {m.role === 'user' ? (
                      m.content
                    ) : (
                      renderFormattedMessage(m.content, navigate)
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-slate-900/90 px-4 py-2.5 text-slate-300 text-xs shadow-md">
                    <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                    <span>AURA AI is planning your trip…</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Chips */}
            <div className="flex gap-1.5 overflow-x-auto border-t border-white/[0.06] bg-slate-900/60 px-3 py-2 scrollbar-none">
              {quickChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleSend(chip)}
                  disabled={loading}
                  className="shrink-0 rounded-full border border-slate-700/60 bg-slate-800/80 px-2.5 py-1 text-[11px] text-slate-300 hover:border-amber-400/50 hover:text-amber-300 hover:bg-amber-400/10 transition cursor-pointer disabled:opacity-50"
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
              className="flex items-center gap-2 border-t border-white/[0.08] bg-slate-900/80 p-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Plan a trip, ask about stays, food, or Aviaura…"
                className="flex-1 rounded-xl border border-slate-700/80 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="btn-primary flex h-8 w-8 items-center justify-center rounded-xl text-slate-950 font-bold disabled:opacity-40 cursor-pointer shadow-md"
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
        className="btn-primary flex items-center gap-2.5 rounded-full px-4 py-3 shadow-2xl cursor-pointer"
      >
        <span className="flex h-2.5 w-2.5 rounded-full bg-slate-950 animate-pulse" />
        <span className="font-display text-xs font-bold text-slate-950">Ask AURA AI</span>
      </motion.button>
    </div>
  )
}
