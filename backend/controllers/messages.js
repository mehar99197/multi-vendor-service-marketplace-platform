import Message from '../models/Message.js';
import Project from '../models/Project.js';
import { createNotification } from '../utils/notify.js';

// Confirm the user is the customer or provider on the project (admins may read too).
// Returns the project, or null if not found / not a party.
const loadProjectForParty = async (projectId, user) => {
  const project = await Project.findById(projectId);
  if (!project) return { project: null, allowed: false };
  const isParty =
    project.customer.toString() === user._id.toString() ||
    project.provider.toString() === user._id.toString();
  return { project, allowed: isParty || user.role === 'admin' };
};

// GET /messages/project/:projectId — full thread (oldest first).
// Side effect: marks messages addressed to the caller as read.
const getProjectMessages = async (req, res) => {
  try {
    const { project, allowed } = await loadProjectForParty(req.params.projectId, req.user);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!allowed) return res.status(403).json({ message: 'Not authorized' });

    const messages = await Message.find({ project: project._id })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 });

    // Mark anything addressed to me as read (clears the unread badge).
    await Message.updateMany(
      { project: project._id, recipient: req.user._id, read: false },
      { read: true }
    );

    res.json(messages);
  } catch (error) {
    console.error('getProjectMessages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /messages — body { project, text }. Sends to the other party of the project.
const sendMessage = async (req, res) => {
  try {
    const { project: projectId, text } = req.body;

    if (typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ message: 'Message text is required' });
    }
    if (text.length > 2000) {
      return res.status(400).json({ message: 'Message is too long (max 2000 characters)' });
    }

    const { project } = await loadProjectForParty(projectId, req.user);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    // Only the two parties may post (an admin can read but not impersonate a side).
    const isCustomer = project.customer.toString() === req.user._id.toString();
    const isProvider = project.provider.toString() === req.user._id.toString();
    if (!isCustomer && !isProvider) {
      return res.status(403).json({ message: 'Only the project participants can send messages' });
    }

    const recipient = isCustomer ? project.provider : project.customer;

    const message = await Message.create({
      project: project._id,
      sender: req.user._id,
      recipient,
      text: text.trim(),
    });

    await createNotification({
      user: recipient,
      type: 'message',
      title: `New message from ${req.user.name}`,
      body: text.trim().slice(0, 120),
      link: `/projects/${project._id}`,
    });

    const populated = await Message.findById(message._id).populate('sender', 'name avatar');
    res.status(201).json(populated);
  } catch (error) {
    console.error('sendMessage error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export { getProjectMessages, sendMessage };
