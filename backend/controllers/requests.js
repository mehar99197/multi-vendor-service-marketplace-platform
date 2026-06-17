import ServiceRequest from '../models/ServiceRequest.js';
import Service from '../models/Service.js';
import Project from '../models/Project.js';

const createRequest = async (req, res) => {
  try {
    const { service: serviceId, requirements, budget, deadline } = req.body;

    if (typeof requirements !== 'string' || !requirements.trim()) {
      return res.status(400).json({ message: 'Requirements are required' });
    }
    if (typeof budget !== 'number' || !(budget > 0)) {
      return res.status(400).json({ message: 'Budget must be a positive number' });
    }
    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime()) || deadlineDate.getTime() <= Date.now()) {
      return res.status(400).json({ message: 'Deadline must be a valid future date' });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    if (service.status !== 'active') {
      return res.status(400).json({ message: 'This service is not available' });
    }
    if (service.provider.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot request your own service' });
    }

    const request = await ServiceRequest.create({
      customer: req.user._id,
      service: serviceId,
      provider: service.provider,
      requirements,
      budget,
      deadline: deadlineDate,
    });

    await Project.create({
      request: request._id,
      customer: req.user._id,
      provider: service.provider,
      service: serviceId,
    });

    res.status(201).json(request);
  } catch (error) {
    console.error('createRequest error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const attachProjectIds = async (requests, ownerId) => {
  const projects = await Project.find({
    $or: [{ customer: ownerId }, { provider: ownerId }],
  }).select('request status');
  const projectMap = {};
  projects.forEach((p) => {
    projectMap[p.request.toString()] = p._id;
  });
  return requests.map((r) => ({ ...r.toObject(), projectId: projectMap[r._id.toString()] || null }));
};

const getMyRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find({ customer: req.user._id })
      .populate('service')
      .populate('provider', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json(await attachProjectIds(requests, req.user._id));
  } catch (error) {
    console.error('getMyRequests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getReceivedRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find({ provider: req.user._id })
      .populate('service')
      .populate('customer', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json(await attachProjectIds(requests, req.user._id));
  } catch (error) {
    console.error('getReceivedRequests error:', error);
    res.status(500).json({ message: 'Server error' });
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
    console.error('getRequestById error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Legal transitions for the request lifecycle (default-deny everything else).
const REQUEST_TRANSITIONS = {
  pending: ['accepted', 'rejected'],
  accepted: ['completed'],
  rejected: [],
  completed: [],
};

const updateRequestStatus = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Must be a party to the request (or admin).
    const isCustomer = request.customer.toString() === req.user._id.toString();
    const isProvider = request.provider.toString() === req.user._id.toString();
    if (!isCustomer && !isProvider && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { status } = req.body;
    if (!REQUEST_TRANSITIONS[request.status] || !REQUEST_TRANSITIONS[request.status].includes(status)) {
      return res.status(400).json({ message: `Cannot change status from ${request.status} to ${status}` });
    }

    // Role rules per transition.
    if ((status === 'accepted' || status === 'rejected') && !isProvider) {
      return res.status(403).json({ message: 'Only the provider can accept or reject requests' });
    }
    if (status === 'completed' && !isCustomer) {
      return res.status(403).json({ message: 'Only the customer can mark as completed' });
    }

    request.status = status;
    const updated = await request.save();

    // Keep the linked project in step.
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
    console.error('updateRequestStatus error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export {
  createRequest,
  getMyRequests,
  getReceivedRequests,
  getRequestById,
  updateRequestStatus,
};
