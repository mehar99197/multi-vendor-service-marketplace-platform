import Service from '../models/Service.js';

const getAllServices = async (req, res) => {
  try {
    const { search, category, sort, page = 1, limit = 12 } = req.query;

    let query = { status: 'active' };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price') sortOption = { price: 1 };
    if (sort === '-price') sortOption = { price: -1 };
    if (sort === 'deliveryTime') sortOption = { deliveryTime: 1 };
    if (sort === '-deliveryTime') sortOption = { deliveryTime: -1 };
    if (sort === 'createdAt') sortOption = { createdAt: 1 };
    if (sort === '-createdAt') sortOption = { createdAt: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const total = await Service.countDocuments(query);
    const services = await Service.find(query)
      .populate('provider', 'name email avatar')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      services,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('provider', 'name email avatar');

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createService = async (req, res) => {
  try {
    const { title, description, category, price, deliveryTime, images } = req.body;

    const service = await Service.create({
      provider: req.user._id,
      title,
      description,
      category,
      price,
      deliveryTime,
      images,
    });

    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (service.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this service' });
    }

    const { title, description, category, price, deliveryTime, images, status } = req.body;

    if (title !== undefined) service.title = title;
    if (description !== undefined) service.description = description;
    if (category !== undefined) service.category = category;
    if (price !== undefined) service.price = price;
    if (deliveryTime !== undefined) service.deliveryTime = deliveryTime;
    if (images !== undefined) service.images = images;
    if (status !== undefined) service.status = status;

    const updated = await service.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (service.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this service' });
    }

    await service.deleteOne();
    res.json({ message: 'Service removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyServices = async (req, res) => {
  try {
    const services = await Service.find({ provider: req.user._id }).sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getMyServices,
};
