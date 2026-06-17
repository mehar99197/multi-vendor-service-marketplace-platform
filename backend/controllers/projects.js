import Project from '../models/Project.js';
import ServiceRequest from '../models/ServiceRequest.js';

const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ customer: req.user._id }, { provider: req.user._id }],
    })
      .populate('service')
      .populate('request', 'requirements budget deadline')
      .populate('customer', 'name email avatar')
      .populate('provider', 'name email avatar')
      .populate('updates.addedBy', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('service')
      .populate('request', 'requirements budget deadline')
      .populate('customer', 'name email avatar')
      .populate('provider', 'name email avatar')
      .populate('updates.addedBy', 'name email avatar');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (
      project.customer._id.toString() !== req.user._id.toString() &&
      project.provider._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProjectStatus = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const { status } = req.body;
    const validStatuses = ['accepted', 'in-progress', 'completed', 'delivered'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Linear workflow (Task req. 5): pending → accepted → in-progress → completed → delivered.
    const transitionFlow = {
      'pending': ['accepted'],
      'accepted': ['in-progress'],
      'in-progress': ['completed'],
      'completed': ['delivered'],
      'delivered': [],
    };

    if (!transitionFlow[project.status] || !transitionFlow[project.status].includes(status)) {
      return res.status(400).json({
        message: `Cannot transition from ${project.status} to ${status}`,
      });
    }

    // The provider drives the work forward; the customer confirms final delivery.
    if (['accepted', 'in-progress', 'completed'].includes(status)) {
      if (project.provider.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Only the provider can update to this status' });
      }
    }

    if (status === 'delivered') {
      if (project.customer.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Only the customer can confirm delivery' });
      }
    }

    project.status = status;
    const updated = await project.save();

    // Keep the linked ServiceRequest lifecycle in step with the project.
    const request = await ServiceRequest.findById(project.request);
    if (request) {
      if (status === 'accepted') {
        request.status = 'accepted';
        await request.save();
      } else if (status === 'delivered') {
        request.status = 'completed';
        await request.save();
      }
    }

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const addProjectUpdate = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (
      project.customer.toString() !== req.user._id.toString() &&
      project.provider.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (project.status === 'delivered') {
      return res.status(400).json({ message: 'This project is delivered and can no longer be updated' });
    }

    const { text } = req.body;
    if (typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ message: 'Update text is required' });
    }
    if (text.length > 2000) {
      return res.status(400).json({ message: 'Update text is too long (max 2000 characters)' });
    }

    project.updates.push({
      text,
      addedBy: req.user._id,
    });

    const updated = await project.save();
    const populated = await Project.findById(updated._id)
      .populate('updates.addedBy', 'name email avatar');

    res.json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export { getMyProjects, getProjectById, updateProjectStatus, addProjectUpdate };
