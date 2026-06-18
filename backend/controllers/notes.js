import Note from '../models/Note.js';
import User from '../models/User.js';

// Normalise a tags payload into a clean, de-duped string array (max 10, trimmed).
const cleanTags = (tags) => {
  if (!Array.isArray(tags)) return [];
  const seen = new Set();
  const out = [];
  for (const t of tags) {
    if (typeof t !== 'string') continue;
    const tag = t.trim().slice(0, 30);
    if (tag && !seen.has(tag.toLowerCase())) {
      seen.add(tag.toLowerCase());
      out.push(tag);
    }
  }
  return out.slice(0, 10);
};

// GET /notes?subject=<userId> — the caller's private notes about one contact.
const getNotes = async (req, res) => {
  try {
    const { subject } = req.query;
    if (!subject) return res.status(400).json({ message: 'A subject (contact) id is required' });

    const notes = await Note.find({ author: req.user._id, subject })
      .populate('subject', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(notes);
  } catch (error) {
    console.error('getNotes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /notes — body { subject, body?, tags? }. Private to the author.
const createNote = async (req, res) => {
  try {
    const { subject, body, tags } = req.body;

    if (!subject) return res.status(400).json({ message: 'A subject (contact) is required' });
    if (subject.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot write a contact note about yourself' });
    }

    const text = typeof body === 'string' ? body.trim() : '';
    const cleanedTags = cleanTags(tags);
    if (!text && cleanedTags.length === 0) {
      return res.status(400).json({ message: 'Add a note or at least one tag' });
    }

    // The subject must be a real user (avoids dangling references).
    const subjectUser = await User.findById(subject).select('_id');
    if (!subjectUser) return res.status(404).json({ message: 'Contact not found' });

    const note = await Note.create({
      author: req.user._id,
      subject,
      body: text.slice(0, 2000),
      tags: cleanedTags,
    });

    const populated = await Note.findById(note._id).populate('subject', 'name avatar');
    res.status(201).json(populated);
  } catch (error) {
    console.error('createNote error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /notes/:id — edit body/tags. Author only.
const updateNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, author: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    const { body, tags } = req.body;
    if (body !== undefined) note.body = (typeof body === 'string' ? body.trim() : '').slice(0, 2000);
    if (tags !== undefined) note.tags = cleanTags(tags);
    note.updatedAt = new Date();

    const updated = await note.save();
    const populated = await Note.findById(updated._id).populate('subject', 'name avatar');
    res.json(populated);
  } catch (error) {
    console.error('updateNote error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /notes/:id — author only.
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, author: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json({ message: 'Note deleted' });
  } catch (error) {
    console.error('deleteNote error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export { getNotes, createNote, updateNote, deleteNote };
