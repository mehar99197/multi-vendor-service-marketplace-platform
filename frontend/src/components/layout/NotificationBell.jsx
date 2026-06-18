import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../../api/notifications'

const POLL_MS = 30000

function timeAgo(date) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

const typeIcon = {
  request: '📨',
  status: '🔄',
  message: '💬',
  review: '⭐',
  task: '✅',
  system: '🔔',
}

export default function NotificationBell() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [unread, setUnread] = useState(0)
  const ref = useRef(null)

  const load = useCallback(async () => {
    try {
      const { notifications, unreadCount } = await getNotifications()
      setItems(notifications || [])
      setUnread(unreadCount || 0)
    } catch {
      /* silent — the bell must never break the page */
    }
  }, [])

  // Poll while logged in so the badge stays roughly live without WebSockets.
  useEffect(() => {
    if (!user) return
    load()
    const id = setInterval(load, POLL_MS)
    return () => clearInterval(id)
  }, [user, load])

  // Close the dropdown on an outside click.
  useEffect(() => {
    if (!open) return
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  if (!user) return null

  const toggle = () => {
    const next = !open
    setOpen(next)
    if (next) load()
  }

  const handleClick = async (n) => {
    setOpen(false)
    if (!n.read) {
      setUnread((u) => Math.max(0, u - 1))
      setItems((prev) => prev.map((x) => (x._id === n._id ? { ...x, read: true } : x)))
      try {
        await markNotificationRead(n._id)
      } catch {
        /* ignore */
      }
    }
    if (n.link) navigate(n.link)
  }

  const handleMarkAll = async () => {
    setUnread(0)
    setItems((prev) => prev.map((x) => ({ ...x, read: true })))
    try {
      await markAllNotificationsRead()
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggle}
        className="relative p-2 text-gray-300 hover:text-white transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unread > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold bg-red-600 text-white rounded-full">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
            <span className="text-sm font-semibold text-white">Notifications</span>
            {unread > 0 && (
              <button
                onClick={handleMarkAll}
                className="text-xs text-indigo-400 hover:text-indigo-300"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-gray-500">No notifications yet.</p>
            ) : (
              items.map((n) => (
                <button
                  key={n._id}
                  onClick={() => handleClick(n)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-700/60 hover:bg-gray-700/40 transition-colors flex gap-3 ${
                    n.read ? 'opacity-60' : ''
                  }`}
                >
                  <span className="text-lg leading-none flex-shrink-0">{typeIcon[n.type] || '🔔'}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white truncate">{n.title}</span>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />}
                    </span>
                    {n.body && <span className="block text-xs text-gray-400 mt-0.5 line-clamp-2">{n.body}</span>}
                    <span className="block text-[11px] text-gray-500 mt-1">{timeAgo(n.createdAt)}</span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
