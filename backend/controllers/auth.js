import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import ServiceProvider from '../models/ServiceProvider.js';

// Roles a client may self-assign at registration. 'admin' is provisioned out-of-band only.
const SELF_ASSIGNABLE_ROLES = ['customer', 'provider'];
const EMAIL_RE = /^\S+@\S+\.\S+$/;
// Constant dummy hash so login takes ~the same time whether or not the user exists (timing-safe).
const DUMMY_HASH = bcrypt.hashSync('timing-equalizer-not-a-real-password', 10);

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d', algorithm: 'HS256' });
};

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Invalid input' });
    }
    if (!name.trim() || !EMAIL_RE.test(email)) {
      return res.status(400).json({ message: 'A valid name and email are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    // Never trust a client-supplied role — only customer/provider, default customer.
    const safeRole = SELF_ASSIGNABLE_ROLES.includes(role) ? role : 'customer';

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password, role: safeRole });

    if (safeRole === 'provider') {
      await ServiceProvider.create({ user: user._id });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token,
    });
  } catch (error) {
    console.error('register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Invalid input' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always run a bcrypt comparison so response timing doesn't reveal whether the email exists.
    const isMatch = user
      ? await user.matchPassword(password)
      : (await bcrypt.compare(password, DUMMY_HASH), false);

    if (!user || !isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token,
    });
  } catch (error) {
    console.error('login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    let providerProfile = null;
    if (user.role === 'provider') {
      providerProfile = await ServiceProvider.findOne({ user: user._id });
    }

    res.json({ user, providerProfile });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, avatar } = req.body;

    const user = await User.findById(req.user._id);

    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ message: 'Invalid name' });
      }
      user.name = name;
    }

    if (email !== undefined) {
      if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
        return res.status(400).json({ message: 'Invalid email' });
      }
      const normalized = email.toLowerCase();
      const clash = await User.findOne({ email: normalized });
      if (clash && clash._id.toString() !== user._id.toString()) {
        return res.status(409).json({ message: 'Email already in use' });
      }
      user.email = normalized;
    }

    if (avatar !== undefined) {
      if (typeof avatar !== 'string') {
        return res.status(400).json({ message: 'Invalid avatar' });
      }
      user.avatar = avatar;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
    });
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export { register, login, getMe, updateProfile };
