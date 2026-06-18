import Service from '../models/Service.js';
import ServiceProvider from '../models/ServiceProvider.js';

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
      .limit(limitNum)
      .lean();

    // The provider's aggregate rating lives on the ServiceProvider profile (keyed by
    // user id), not on the User the service references — join it in so cards show stars.
    const providerIds = [
      ...new Set(services.map((s) => s.provider?._id?.toString()).filter(Boolean)),
    ];
    const profiles = await ServiceProvider.find({ user: { $in: providerIds } }).select(
      'user rating numReviews'
    );
    const ratingMap = {};
    profiles.forEach((p) => {
      ratingMap[p.user.toString()] = { rating: p.rating, numReviews: p.numReviews };
    });
    services.forEach((s) => {
      const stats = (s.provider && ratingMap[s.provider._id.toString()]) || { rating: 0, numReviews: 0 };
      if (s.provider) {
        s.provider.rating = stats.rating;
        s.provider.numReviews = stats.numReviews;
      }
      s.averageRating = stats.rating;
      s.reviewCount = stats.numReviews;
    });

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
    const service = await Service.findById(req.params.id).populate('provider', 'name avatar').lean();

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Merge the provider's profile aggregate (rating/numReviews/skills) into the response.
    const profile = service.provider
      ? await ServiceProvider.findOne({ user: service.provider._id }).select('rating numReviews skills')
      : null;
    if (service.provider) {
      service.provider.rating = profile?.rating || 0;
      service.provider.numReviews = profile?.numReviews || 0;
      service.provider.skills = profile?.skills || [];
    }
    service.averageRating = profile?.rating || 0;
    service.reviewCount = profile?.numReviews || 0;

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
