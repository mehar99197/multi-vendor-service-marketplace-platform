import ServiceProvider from '../models/ServiceProvider.js';
import Service from '../models/Service.js';
import ServiceRequest from '../models/ServiceRequest.js';
import Project from '../models/Project.js';
import Review from '../models/Review.js';

const getAllProviders = async (req, res) => {
  try {
    const { search, skill } = req.query;
    let query = {};

    if (typeof skill === 'string' && skill) {
      query.skills = { $in: [skill] };
    }

    let providers = await ServiceProvider.find(query).populate('user', 'name avatar');

    if (typeof search === 'string' && search) {
      const term = search.toLowerCase();
      providers = providers.filter((p) => p.user && p.user.name.toLowerCase().includes(term));
    }

    res.json(providers);
  } catch (error) {
    console.error('getAllProviders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getProviderById = async (req, res) => {
  try {
    const provider = await ServiceProvider.findOne({ user: req.params.id }).populate('user', 'name avatar');

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    const services = await Service.find({ provider: req.params.id, status: 'active' });

    res.json({ provider, services });
  } catch (error) {
    console.error('getProviderById error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProviderProfile = async (req, res) => {
  try {
    let provider = await ServiceProvider.findOne({ user: req.user._id });

    if (!provider) {
      provider = await ServiceProvider.create({ user: req.user._id });
    }

    const { bio, skills, experience, pricing } = req.body;

    if (bio !== undefined) provider.bio = typeof bio === 'string' ? bio : provider.bio;
    if (skills !== undefined && Array.isArray(skills)) {
      provider.skills = skills.filter((s) => typeof s === 'string');
    }
    if (experience !== undefined && Array.isArray(experience)) provider.experience = experience;
    if (pricing !== undefined && typeof pricing === 'object') provider.pricing = pricing;

    const updated = await provider.save();
    res.json(updated);
  } catch (error) {
    console.error('updateProviderProfile error:', error);
    res.status(500).json({ message: 'Server error' });
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
    console.error('addPortfolioItem error:', error);
    res.status(500).json({ message: 'Server error' });
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
    console.error('deletePortfolioItem error:', error);
    res.status(500).json({ message: 'Server error' });
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
      reviewsCount > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount : 0;

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
    console.error('getProviderStats error:', error);
    res.status(500).json({ message: 'Server error' });
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
