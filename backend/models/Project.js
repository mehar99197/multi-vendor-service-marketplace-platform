import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceRequest',
    required: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in-progress', 'completed', 'delivered', 'cancelled'],
    default: 'pending',
  },
  updates: [
    {
      text: String,
      addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Dashboard list: a user's projects as customer OR provider, newest-first. The $or
// query uses these two indexes via index union; each keeps the createdAt sort served.
projectSchema.index({ customer: 1, createdAt: -1 });
projectSchema.index({ provider: 1, createdAt: -1 });
// 1-to-1 request→project lookup used to keep the two lifecycles in step.
projectSchema.index({ request: 1 });

const Project = mongoose.model('Project', projectSchema);

export default Project;
