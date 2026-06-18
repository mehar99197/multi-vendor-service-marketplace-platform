import Review from '../models/Review.js';
import ServiceRequest from '../models/ServiceRequest.js';
import ServiceProvider from '../models/ServiceProvider.js';
import { createNotification } from '../utils/notify.js';

const createReview = async (req, res) => {
  try {
    const { request: requestId, rating, feedback } = req.body;

    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: 'Rating must be an integer from 1 to 5' });
    }
    if (feedback !== undefined && typeof feedback !== 'string') {
      return res.status(400).json({ message: 'Invalid feedback' });
    }

    const serviceRequest = await ServiceRequest.findById(requestId);
    if (!serviceRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Only the customer who made the request may review it.
    if (serviceRequest.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the customer who made the request can review' });
    }

    // Only completed engagements can be reviewed (no reviewing pending/rejected work).
    if (serviceRequest.status !== 'completed') {
      return res.status(400).json({ message: 'You can only review a completed request' });
    }

    const existingReview = await Review.findOne({ request: requestId, customer: req.user._id });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this request' });
    }

    // Derive provider/service from the request — NEVER trust them from the client body.
    const provider = serviceRequest.provider;
    const service = serviceRequest.service;

    const review = await Review.create({
      customer: req.user._id,
      provider,
      service,
      request: requestId,
      rating: numericRating,
      feedback: feedback || '',
    });

    // Recompute the provider's aggregate rating from the trusted provider id.
    const allReviews = await Review.find({ provider });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / allReviews.length;

    await ServiceProvider.findOneAndUpdate(
      { user: provider },
      { rating: averageRating, numReviews: allReviews.length }
    );

    // Let the provider know they were reviewed.
    await createNotification({
      user: provider,
      type: 'review',
      title: 'New review received',
      body: `${req.user.name} left you a ${numericRating}-star review.`,
      link: '/dashboard/provider',
    });

    res.status(201).json(review);
  } catch (error) {
    // Compound unique index {request, customer} guards against duplicate races.
    if (error && error.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this request' });
    }
    console.error('createReview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getProviderReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ provider: req.params.providerId })
      .populate('customer', 'name avatar')
      .populate('service', 'title')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error('getProviderReviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ customer: req.user._id })
      .populate('provider', 'name avatar')
      .populate('service', 'title')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error('getMyReviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export { createReview, getProviderReviews, getMyReviews };
