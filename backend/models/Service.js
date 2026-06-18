import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Web Development',
      'Graphic Design',
      'Content Writing',
      'Digital Marketing',
      'Logo Design',
      'Social Media Management',
      'Video Editing',
      'Mobile Development',
      'SEO',
      'Other',
    ],
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  deliveryTime: {
    type: Number,
    required: true,
    min: 1,
  },
  images: [String],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Browse: active services newest-first (default sort) serves the no-category case;
// the 3-field index serves category-filtered browse. Both keep the createdAt sort
// index-served instead of a blocking in-memory sort.
serviceSchema.index({ status: 1, createdAt: -1 });
serviceSchema.index({ status: 1, category: 1, createdAt: -1 });
// A provider's own service list (getMyServices), newest-first.
serviceSchema.index({ provider: 1, createdAt: -1 });

const Service = mongoose.model('Service', serviceSchema);

export default Service;
