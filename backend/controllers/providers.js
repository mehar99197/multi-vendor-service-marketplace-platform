import ServiceProvider from '../models/ServiceProvider.js';
import User from '../models/User.js';
import Service from '../models/Service.js';
import ServiceRequest from '../models/ServiceRequest.js';
import Project from '../models/Project.js';
import Review from '../models/Review.js';

const getAllProviders = async (req, res) => {
  try {
    const { search, skill } = req.query;
    let query = {};

    if (skill) {
      query.skills = { $in: [skill] };
    }

    let providers = await ServiceProvider.find(query).populate('user', 'name email avatar');

    if (search) {
      providers = providers.filter((p) =>
        p.user && p.user.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json(providers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProviderById = async (req, res) => {
  try {
    const provider = await ServiceProvider.findOne({ user: req.params.id }).populate(
      'user',
      'name email avatar'
    );

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    const services = await Service.find({ provider: req.params.id, status: 'active' });

    res.json({ provider, services });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProviderProfile = async (req, res) => {
  try {
    let provider = await ServiceProvider.findOne({ user: req.user._id });

    if (!provider) {
      provider = await ServiceProvider.create({ user: req.user._id });
    }

    const { bio, skills, experience, pricing } = req.body;

    if (bio !== undefined) provider.bio = bio;
    if (skills !== undefined) provider.skills = skills;
    if (experience !== undefined) provider.experience = experience;
    if (pricing !== undefined) provider.pricing = pricing;

    const updated = await provider.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addPortfolioItem = async (req, res) => {
  try {
    const provider = await ServiceProvider.findOne({ user: req.user._id });

    if (!provider) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    const { title, description, image, link } = req.body;
    provider.portfolio.push({ title, description, image, link });

    const updated = await provider.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deletePortfolioItem = async (req, res) => {
  try {
    const provider = await ServiceProvider.findOne({ user: req.user._id });

    if (!provider) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    provider.portfolio.pull({ _id: req.params.itemId });
    const updated = await provider.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProviderStats = async (req, res) => {
  try {
    const providerId = req.user._id;

    const totalProjects = await Project.countDocuments({ provider: providerId });
    const activeProjects = await Project.countDocuments({
      provider: providerId,
      status: { $in: ['accepted', 'in-progress'] },
    });
    const completedProjects = await Project.countDocuments({
      provider: providerId,
      status: 'completed',
    });

    const completedRequests = await ServiceRequest.find({
      provider: providerId,
      status: 'completed',
    });
    const earningsTotal = completedRequests.reduce((sum, r) => sum + r.budget, 0);

    const pendingRequests = await ServiceRequest.countDocuments({
      provider: providerId,
      status: 'pending',
    });

    const reviews = await Review.find({ provider: providerId });
    const reviewsCount = reviews.length;
    const averageRating =
      reviewsCount > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount
        : 0;

    res.json({
      totalProjects,
      activeProjects,
      completedProjects,
      earningsTotal,
      pendingRequests,
      reviewsCount,
      averageRating,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getAllProviders,
  getProviderById,
  updateProviderProfile,
  addPortfolioItem,
  deletePortfolioItem,
  getProviderStats,
};
