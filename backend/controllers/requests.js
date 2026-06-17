import ServiceRequest from '../models/ServiceRequest.js';
import Service from '../models/Service.js';
import Project from '../models/Project.js';

const createRequest = async (req, res) => {
  try {
    const { service: serviceId, requirements, budget, deadline } = req.body;

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const request = await ServiceRequest.create({
      customer: req.user._id,
      service: serviceId,
      provider: service.provider,
      requirements,
      budget,
      deadline,
    });

    await Project.create({
      request: request._id,
      customer: req.user._id,
      provider: service.provider,
      service: serviceId,
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find({ customer: req.user._id })
      .populate('service')
      .populate('provider', 'name email avatar')
      .sort({ createdAt: -1 });

    const projects = await Project.find({ customer: req.user._id }).select('request status');
    const projectMap = {};
    projects.forEach((p) => {
      projectMap[p.request.toString()] = p._id;
    });

    const requestsWithProject = requests.map((r) => ({
      ...r.toObject(),
      projectId: projectMap[r._id.toString()] || null,
    }));

    res.json(requestsWithProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReceivedRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find({ provider: req.user._id })
      .populate('service')
      .populate('customer', 'name email avatar')
      .sort({ createdAt: -1 });

    const projects = await Project.find({ provider: req.user._id }).select('request status');
    const projectMap = {};
    projects.forEach((p) => {
      projectMap[p.request.toString()] = p._id;
    });

    const requestsWithProject = requests.map((r) => ({
      ...r.toObject(),
      projectId: projectMap[r._id.toString()] || null,
    }));

    res.json(requestsWithProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRequestById = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id)
      .populate('service')
      .populate('customer', 'name email avatar')
      .populate('provider', 'name email avatar');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (
      request.customer._id.toString() !== req.user._id.toString() &&
      request.provider._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateRequestStatus = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const { status } = req.body;

    if (status === 'accepted' || status === 'rejected') {
      if (request.provider.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Only the provider can accept or reject requests' });
      }
    }

    if (status === 'completed') {
      if (request.customer.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Only the customer can mark as completed' });
      }
    }

    request.status = status;
    const updated = await request.save();

    const project = await Project.findOne({ request: request._id });
    if (project) {
      if (status === 'accepted') {
        project.status = 'accepted';
        await project.save();
      } else if (status === 'completed') {
        project.status = 'completed';
        await project.save();
      }
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  createRequest,
  getMyRequests,
  getReceivedRequests,
  getRequestById,
  updateRequestStatus,
};
