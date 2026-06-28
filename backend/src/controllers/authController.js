import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, upiId } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ status: 'fail', message: 'User already exists' });

    const user = await User.create({ name, email, password, phone, upiId });
    res.status(201).json({ status: 'success', data: { _id: user._id, token: generateToken(user._id) } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.status(200).json({ status: 'success', data: { _id: user._id, token: generateToken(user._id) } });
    } else {
      res.status(401).json({ status: 'fail', message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json({ status: 'success', data: user });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ─── SEARCH BY NAME OR PHONE NUMBER ───
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(200).json({ status: 'success', data: [] });

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } }
      ],
      _id: { $ne: req.user._id } // Don't show myself
    }).select('name email phone').limit(10);

    res.status(200).json({ status: 'success', data: users });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};