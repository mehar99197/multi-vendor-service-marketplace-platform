import Notification from '../models/Notification.js';

// GET /notifications — the caller's recent notifications + unread count for the bell.
const getNotifications = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 30, 100);

    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit);

    const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error('getNotifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /notifications/:id/read — mark one of the caller's notifications read.
const markRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, user: req.user._id });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (error) {
    console.error('markRead error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /notifications/read-all — clear the caller's unread badge.
const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('markAllRead error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export { getNotifications, markRead, markAllRead };
