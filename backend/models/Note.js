import mongoose from 'mongoose';

// A private CRM note (with tags) one user keeps about another (a "contact").
// Only the author can ever see or edit their notes — the subject is never told.
const noteSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // The contact this note is about (e.g. a provider's note about a customer).
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  body: {
    type: String,
    default: '',
    maxlength: 2000,
  },
  tags: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// "Notes I wrote about this contact", newest first.
noteSchema.index({ author: 1, subject: 1, createdAt: -1 });

const Note = mongoose.model('Note', noteSchema);

export default Note;
