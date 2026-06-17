import Service from '../models/Service.js';

const CATEGORIES = Service.schema.path('category').enumValues;
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getAllServices = async (req, res) => {
  try {
    const { search, category, sort, page = 1, limit = 12 } = req.query;

    let query = { status: 'active' };

    if (typeof category === 'string' && category) {
      query.category = category;
    }

    if (typeof search === 'string' && search.trim()) {
      // Escape regex metacharacters and cap length to prevent ReDoS / regex injection.
      const safe = escapeRegex(search.trim().slice(0, 100));
      query.$or = [
        { title: { $regex: safe, $options: 'i' } },
        { description: { $regex: safe, $options: 'i' } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price') sortOption = { price: 1 };
    if (sort === '-price') sortOption = { price: -1 };
    if (sort === 'deliveryTime') sortOption = { deliveryTime: 1 };
    if (sort === '-deliveryTime') sortOption = { deliveryTime: -1 };
    if (sort === 'createdAt') sortOption = { createdAt: 1 };
    if (sort === '-createdAt') sortOption = { createdAt: -1 };

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 12)); // cap page size
    const skip = (pageNum - 1) * limitNum;

    const total = await Service.countDocuments(query);
    const services = await Service.find(query)
      .populate('provider', 'name avatar')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.json({
      services,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      total,
    });
  } catch (error) {
    console.error('getAllServices error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('provider', 'name avatar');

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json(service);
  } catch (error) {
    console.error('getServiceById error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const validateServiceInput = ({ category, price, deliveryTime }) => {
  if (category !== undefined && !CATEGORIES.includes(category)) return 'Invalid category';
  if (price !== undefined && (typeof price !== 'number' || !(price > 0))) return 'Price must be a positive number';
  if (deliveryTime !== undefined && (!Number.isInteger(deliveryTime) || deliveryTime < 1))
    return 'Delivery time must be a positive whole number of days';
  return null;
};

const createService = async (req, res) => {
  try {
    const { title, description, category, price, deliveryTime, images } = req.body;

    if (typeof title !== 'string' || !title.trim() || typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({ message: 'Title and description are required' });
    }
    const err = validateServiceInput({ category, price, deliveryTime });
    if (err || category === undefined || price === undefined || deliveryTime === undefined) {
      return res.status(400).json({ message: err || 'Category, price and delivery time are required' });
    }
    const safeImages = Array.isArray(images) ? images.filter((i) => typeof i === 'string') : [];

    const service = await Service.create({
      provider: req.user._id,
      title,
      description,
      category,
      price,
      deliveryTime,
      images: safeImages,
    });

    res.status(201).json(service);
  } catch (error) {
    console.error('createService error:', error);
    res.status(500).json({ message: 'Server error' });
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

    const err = validateServiceInput({ category, price, deliveryTime });
    if (err) return res.status(400).json({ message: err });

    if (title !== undefined) service.title = title;
    if (description !== undefined) service.description = description;
    if (category !== undefined) service.category = category;
    if (price !== undefined) service.price = price;
    if (deliveryTime !== undefined) service.deliveryTime = deliveryTime;
    if (images !== undefined && Array.isArray(images)) {
      service.images = images.filter((i) => typeof i === 'string');
    }
    if (status !== undefined && ['active', 'inactive'].includes(status)) service.status = status;

    const updated = await service.save();
    res.json(updated);
  } catch (error) {
    console.error('updateService error:', error);
    res.status(500).json({ message: 'Server error' });
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
    console.error('deleteService error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyServices = async (req, res) => {
  try {
    const services = await Service.find({ provider: req.user._id }).sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    console.error('getMyServices error:', error);
    res.status(500).json({ message: 'Server error' });
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
