import mongoose from 'mongoose';

// A 1:1 message between the two parties of a project (customer ↔ provider).
// Scoped to a project so the conversation always has a shared context.
const messageSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Fetching a thread (newest-last) and counting unread per recipient.
messageSchema.index({ project: 1, createdAt: 1 });
messageSchema.index({ recipient: 1, read: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
