import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMyTasks, updateTask } from '../../api/tasks'

function isOverdue(task) {
  return task.dueDate && new Date(task.dueDate).getTime() < Date.now()
}

// Dashboard summary of the user's open follow-up tasks across all projects.
export default function TasksWidget() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getMyTasks()
      .then((data) => {
        if (active) setTasks(data.filter((t) => !t.completed))
      })
      .catch(() => {})
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const handleComplete = async (task) => {
    setTasks((prev) => prev.filter((t) => t._id !== task._id))
    try {
      await updateTask(task._id, { completed: true })
    } catch {
      /* leave it removed locally; dashboard reload will resync */
    }
  }

  if (loading) return null
  if (tasks.length === 0) return null

  // Soonest due first; tasks without a due date fall to the end.
  const sorted = [...tasks].sort((a, b) => {
    const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
    const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
    return da - db
  })

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 mb-8">
      <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Follow-up Tasks ({tasks.length})</h2>
        <span className="text-xs text-gray-500">your private reminders</span>
      </div>
      <ul className="divide-y divide-gray-700">
        {sorted.slice(0, 8).map((task) => (
          <li key={task._id} className="px-6 py-3 flex items-center gap-3">
            <input
              type="checkbox"
              checked={false}
              onChange={() => handleComplete(task)}
              className="h-4 w-4 rounded border-gray-600 bg-gray-700 accent-indigo-500 cursor-pointer"
              aria-label="Mark task complete"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-white truncate">{task.title}</p>
              <p className="text-xs text-gray-400">
                {task.project?.service?.title || 'Project'}
                {task.dueDate && (
                  <span className={isOverdue(task) ? 'text-red-400' : ''}>
                    {' · due '}
                    {new Date(task.dueDate).toLocaleDateString()}
                    {isOverdue(task) ? ' (overdue)' : ''}
                  </span>
                )}
              </p>
            </div>
            {task.project?._id && (
              <Link
                to={`/projects/${task.project._id}`}
                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs font-medium transition-colors flex-shrink-0"
              >
                Open
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
