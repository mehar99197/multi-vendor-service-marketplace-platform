import Notification from '../models/Notification.js';

// Fire-and-forget notification creator. It NEVER throws: a notification failure
// must not break the core action (request/status/message/review) that triggered
// it, so all errors are swallowed and logged.
export async function createNotification({ user, type = 'system', title, body = '', link = '' }) {
  try {
    if (!user || !title) return null;
    return await Notification.create({ user, type, title, body, link });
  } catch (err) {
    console.error('createNotification error:', err);
    return null;
  }
}

export default createNotification;
