import { useState, useEffect, useCallback } from 'react'
import { getNotes, createNote, deleteNote } from '../../api/notes'

export default function ContactNotes({ subjectId, subjectName }) {
  const [notes, setNotes] = useState([])
  const [body, setBody] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!subjectId) return
    try {
      const data = await getNotes(subjectId)
      setNotes(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notes')
    } finally {
      setLoading(false)
    }
  }, [subjectId])

  useEffect(() => {
    load()
  }, [load])

  const handleAdd = async (e) => {
    e.preventDefault()
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    if (!body.trim() && tags.length === 0) {
      setError('Add a note or at least one tag.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const note = await createNote({ subject: subjectId, body: body.trim(), tags })
      setNotes((prev) => [note, ...prev])
      setBody('')
      setTagsInput('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save note')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    setNotes((prev) => prev.filter((n) => n._id !== id))
    try {
      await deleteNote(id)
    } catch {
      load()
    }
  }

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-lg font-semibold">Private Notes</h3>
        <span className="text-xs text-gray-500">only you can see these</span>
      </div>
      <p className="text-sm text-gray-400 mb-4">
        Keep CRM notes and tags about <span className="text-gray-200">{subjectName || 'this contact'}</span>.
      </p>

      <form onSubmit={handleAdd} className="mb-4 space-y-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          placeholder="e.g. Prefers email, fast to respond, wants weekly updates…"
          maxLength={2000}
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-y"
        />
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="Tags (comma separated): vip, repeat, urgent"
            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-60 text-white rounded-xl text-sm font-medium glow-indigo transition-all"
          >
            {saving ? 'Saving…' : 'Save Note'}
          </button>
        </div>
      </form>

      {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

      {loading ? (
        <p className="text-center text-gray-500 text-sm py-6">Loading notes…</p>
      ) : notes.length === 0 ? (
        <p className="text-center text-gray-500 text-sm py-6">No notes yet.</p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note._id} className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {note.body && <p className="text-sm text-gray-200 whitespace-pre-wrap break-words">{note.body}</p>}
                  {note.tags?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {note.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full text-xs bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-[11px] text-gray-500 mt-2">
                    {note.createdAt ? new Date(note.createdAt).toLocaleString() : ''}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(note._id)}
                  className="text-gray-500 hover:text-red-400 transition-colors text-sm flex-shrink-0"
                  aria-label="Delete note"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
