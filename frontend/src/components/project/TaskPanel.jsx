import { useState, useEffect, useCallback } from 'react'
import { getMyTasks, createTask, updateTask, deleteTask } from '../../api/tasks'

function isOverdue(task) {
  return task.dueDate && !task.completed && new Date(task.dueDate).getTime() < Date.now()
}

export default function TaskPanel({ projectId }) {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const data = await getMyTasks(projectId)
      setTasks(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    load()
  }, [load])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setAdding(true)
    setError('')
    try {
      const task = await createTask({ project: projectId, title: title.trim(), dueDate: dueDate || undefined })
      setTasks((prev) => [...prev, task])
      setTitle('')
      setDueDate('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add task')
    } finally {
      setAdding(false)
    }
  }

  const handleToggle = async (task) => {
    setTasks((prev) => prev.map((t) => (t._id === task._id ? { ...t, completed: !t.completed } : t)))
    try {
      await updateTask(task._id, { completed: !task.completed })
    } catch {
      load() // revert to server truth on failure
    }
  }

  const handleDelete = async (id) => {
    setTasks((prev) => prev.filter((t) => t._id !== id))
    try {
      await deleteTask(id)
    } catch {
      load()
    }
  }

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">My Follow-up Tasks</h3>
        <span className="text-xs text-gray-500">private to you</span>
      </div>

      <form onSubmit={handleAdd} className="mb-4 flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a follow-up task…"
          maxLength={200}
          className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        />
        <button
          type="submit"
          disabled={adding || !title.trim()}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-60 text-white rounded-xl text-sm font-medium glow-indigo transition-all"
        >
          Add
        </button>
      </form>

      {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

      {loading ? (
        <p className="text-center text-gray-500 text-sm py-6">Loading tasks…</p>
      ) : tasks.length === 0 ? (
        <p className="text-center text-gray-500 text-sm py-6">No tasks yet. Add a reminder above.</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task._id}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggle(task)}
                className="h-4 w-4 rounded border-white/10 bg-white/5 accent-indigo-500 cursor-pointer"
              />
              <div className="min-w-0 flex-1">
                <p className={`text-sm ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                  {task.title}
                </p>
                {task.dueDate && (
                  <p className={`text-xs ${isOverdue(task) ? 'text-red-400' : 'text-gray-400'}`}>
                    Due {new Date(task.dueDate).toLocaleDateString()}
                    {isOverdue(task) ? ' · overdue' : ''}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleDelete(task._id)}
                className="text-gray-500 hover:text-red-400 transition-colors text-sm"
                aria-label="Delete task"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
