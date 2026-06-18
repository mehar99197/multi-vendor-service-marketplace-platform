import mongoose from 'mongoose';

// A private follow-up reminder a party keeps on a project (CRM-style task).
// Tasks are owned by their creator — each side manages its own to-dos.
const taskSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    default: '',
    maxlength: 1000,
  },
  dueDate: {
    type: Date,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// "My tasks" board: a user's open tasks ordered by due date.
taskSchema.index({ createdBy: 1, completed: 1, dueDate: 1 });

const Task = mongoose.model('Task', taskSchema);

export default Task;
