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
  },
  deliveryTime: {
    type: Number,
    required: true,
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

const Service = mongoose.model('Service', serviceSchema);

export default Service;
