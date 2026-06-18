import Task from '../models/Task.js';
import Project from '../models/Project.js';

// GET /tasks — the caller's own follow-up tasks. Optional ?project=<id> filter.
const getMyTasks = async (req, res) => {
  try {
    const query = { createdBy: req.user._id };
    if (req.query.project) query.project = req.query.project;

    const tasks = await Task.find(query)
      .populate({ path: 'project', select: 'service', populate: { path: 'service', select: 'title' } })
      // Open tasks first, then by soonest due date.
      .sort({ completed: 1, dueDate: 1, createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error('getMyTasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /tasks — body { project, title, description?, dueDate? }.
const createTask = async (req, res) => {
  try {
    const { project: projectId, title, description, dueDate } = req.body;

    if (typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    // Must be a party to the project the task hangs off of.
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const isParty =
      project.customer.toString() === req.user._id.toString() ||
      project.provider.toString() === req.user._id.toString();
    if (!isParty) return res.status(403).json({ message: 'Not authorized for this project' });

    let due;
    if (dueDate !== undefined && dueDate !== null && dueDate !== '') {
      due = new Date(dueDate);
      if (isNaN(due.getTime())) return res.status(400).json({ message: 'Invalid due date' });
    }

    const task = await Task.create({
      project: project._id,
      createdBy: req.user._id,
      title: title.trim(),
      description: typeof description === 'string' ? description.slice(0, 1000) : '',
      dueDate: due,
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('createTask error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /tasks/:id — edit fields or toggle completion. Owner only.
const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const { title, description, dueDate, completed } = req.body;

    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ message: 'Task title cannot be empty' });
      }
      task.title = title.trim();
    }
    if (description !== undefined) task.description = typeof description === 'string' ? description.slice(0, 1000) : '';
    if (completed !== undefined) task.completed = Boolean(completed);
    if (dueDate !== undefined) {
      if (dueDate === null || dueDate === '') {
        task.dueDate = undefined;
      } else {
        const due = new Date(dueDate);
        if (isNaN(due.getTime())) return res.status(400).json({ message: 'Invalid due date' });
        task.dueDate = due;
      }
    }

    const updated = await task.save();
    res.json(updated);
  } catch (error) {
    console.error('updateTask error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /tasks/:id — owner only.
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('deleteTask error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export { getMyTasks, createTask, updateTask, deleteTask };
