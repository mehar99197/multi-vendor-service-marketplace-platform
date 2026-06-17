import Review from '../models/Review.js';
import ServiceRequest from '../models/ServiceRequest.js';
import ServiceProvider from '../models/ServiceProvider.js';

const createReview = async (req, res) => {
  try {
    const { provider, service, request: requestId, rating, feedback } = req.body;

    const serviceRequest = await ServiceRequest.findById(requestId);
    if (!serviceRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (serviceRequest.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the customer who made the request can review' });
    }

    const existingReview = await Review.findOne({ request: requestId, customer: req.user._id });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this request' });
    }

    const review = await Review.create({
      customer: req.user._id,
      provider,
      service,
      request: requestId,
      rating,
      feedback,
    });

    const allReviews = await Review.find({ provider });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / allReviews.length;

    await ServiceProvider.findOneAndUpdate(
      { user: provider },
      { rating: averageRating, numReviews: allReviews.length }
    );

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProviderReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ provider: req.params.providerId })
      .populate('customer', 'name email avatar')
      .populate('service', 'title')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ customer: req.user._id })
      .populate('provider', 'name email avatar')
      .populate('service', 'title')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { createReview, getProviderReviews, getMyReviews };
