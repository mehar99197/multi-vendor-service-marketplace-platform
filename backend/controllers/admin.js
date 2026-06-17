import User from '../models/User.js';
import Service from '../models/Service.js';
import ServiceRequest from '../models/ServiceRequest.js';
import Project from '../models/Project.js';

const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await User.countDocuments();
    const users = await User.find().select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit);

    res.json({
      users,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const customers = await User.countDocuments({ role: 'customer' });
    const providers = await User.countDocuments({ role: 'provider' });
    const admins = await User.countDocuments({ role: 'admin' });

    res.json({ totalUsers, customers, providers, admins });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getServiceStats = async (req, res) => {
  try {
    const totalServices = await Service.countDocuments();
    const activeServices = await Service.countDocuments({ status: 'active' });
    const inactiveServices = await Service.countDocuments({ status: 'inactive' });

    const categories = await Service.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({ totalServices, activeServices, inactiveServices, categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getRequestStats = async (req, res) => {
  try {
    const totalRequests = await ServiceRequest.countDocuments();
    const pending = await ServiceRequest.countDocuments({ status: 'pending' });
    const accepted = await ServiceRequest.countDocuments({ status: 'accepted' });
    const rejected = await ServiceRequest.countDocuments({ status: 'rejected' });
    const completed = await ServiceRequest.countDocuments({ status: 'completed' });

    res.json({ totalRequests, pending, accepted, rejected, completed });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getProjectStats = async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();
    const pending = await Project.countDocuments({ status: 'pending' });
    const accepted = await Project.countDocuments({ status: 'accepted' });
    const inProgress = await Project.countDocuments({ status: 'in-progress' });
    const completed = await Project.countDocuments({ status: 'completed' });
    const delivered = await Project.countDocuments({ status: 'delivered' });

    res.json({ totalProjects, pending, accepted, inProgress, completed, delivered });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const userCounts = {
      total: await User.countDocuments(),
      customers: await User.countDocuments({ role: 'customer' }),
      providers: await User.countDocuments({ role: 'provider' }),
      admins: await User.countDocuments({ role: 'admin' }),
    };

    const serviceCounts = {
      total: await Service.countDocuments(),
      active: await Service.countDocuments({ status: 'active' }),
      inactive: await Service.countDocuments({ status: 'inactive' }),
    };

    const requestCounts = {
      total: await ServiceRequest.countDocuments(),
      pending: await ServiceRequest.countDocuments({ status: 'pending' }),
      accepted: await ServiceRequest.countDocuments({ status: 'accepted' }),
      rejected: await ServiceRequest.countDocuments({ status: 'rejected' }),
      completed: await ServiceRequest.countDocuments({ status: 'completed' }),
    };

    const projectCounts = {
      total: await Project.countDocuments(),
      pending: await Project.countDocuments({ status: 'pending' }),
      accepted: await Project.countDocuments({ status: 'accepted' }),
      inProgress: await Project.countDocuments({ status: 'in-progress' }),
      completed: await Project.countDocuments({ status: 'completed' }),
      delivered: await Project.countDocuments({ status: 'delivered' }),
    };

    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentRequests = await ServiceRequest.find()
      .populate('customer', 'name')
      .populate('provider', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      userCounts,
      serviceCounts,
      requestCounts,
      projectCounts,
      recentUsers,
      recentRequests,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export {
  getUsers,
  getUserStats,
  getServiceStats,
  getRequestStats,
  getProjectStats,
  getDashboardStats,
};
