import mongoose from 'mongoose';

const serviceProviderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  bio: {
    type: String,
    default: '',
  },
  skills: [String],
  experience: [
    {
      title: String,
      company: String,
      from: Date,
      to: Date,
      current: Boolean,
      description: String,
    },
  ],
  pricing: {
    startingFrom: Number,
    currency: { type: String, default: 'USD' },
  },
  portfolio: [
    {
      title: String,
      description: String,
      image: String,
      link: String,
    },
  ],
  rating: {
    type: Number,
    default: 0,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ServiceProvider = mongoose.model('ServiceProvider', serviceProviderSchema);

export default ServiceProvider;
