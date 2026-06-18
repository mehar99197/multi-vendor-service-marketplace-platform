import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getProjectMessages, sendMessage } from '../../api/messages'

const POLL_MS = 12000

export default function MessageThread({ projectId }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  const load = useCallback(async () => {
    try {
      const data = await getProjectMessages(projectId)
      setMessages(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load messages')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  // Light polling keeps the thread roughly live without WebSockets.
  useEffect(() => {
    load()
    const id = setInterval(load, POLL_MS)
    return () => clearInterval(id)
  }, [load])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setSending(true)
    setError('')
    try {
      const msg = await sendMessage(projectId, text.trim())
      setMessages((prev) => [...prev, msg])
      setText('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-lg font-semibold mb-4">Messages</h3>

      <div className="h-72 overflow-y-auto rounded-xl border border-white/10 bg-black/20 p-4 space-y-3">
        {loading ? (
          <p className="text-center text-gray-500 text-sm py-8">Loading messages…</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-500 text-sm py-8">
            No messages yet. Start the conversation.
          </p>
        ) : (
          messages.map((m) => {
            const senderId = m.sender?._id || m.sender
            const mine = String(senderId) === String(user?._id)
            return (
              <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    mine
                      ? 'bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white rounded-br-sm glow-indigo'
                      : 'bg-white/10 text-gray-100 rounded-bl-sm'
                  }`}
                >
                  {!mine && (
                    <p className="text-[11px] font-medium text-indigo-300 mb-0.5">
                      {m.sender?.name || 'User'}
                    </p>
                  )}
                  <p className="text-sm whitespace-pre-wrap break-words">{m.text}</p>
                  <p className={`text-[10px] mt-1 ${mine ? 'text-indigo-100' : 'text-gray-400'}`}>
                    {m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <form onSubmit={handleSend} className="mt-4 flex gap-3">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          maxLength={2000}
          className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-60 text-white rounded-xl text-sm font-medium glow-indigo transition-all"
        >
          {sending ? 'Sending…' : 'Send'}
        </button>
      </form>
    </div>
  )
}
