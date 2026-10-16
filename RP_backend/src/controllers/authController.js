import jwt from 'jsonwebtoken';
import { AdminUser } from '../models/AdminUser.js';
import { Product } from '../models/Product.js';
import { City } from '../models/City.js';
import { CityProduct } from '../models/CityProduct.js';
import { Enquiry } from '../models/Enquiry.js';
import { logAudit } from '../utils/audit.js';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/jwt.js';

const generateToken = (id) => {
  return jwt.sign(
    { id },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await AdminUser.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Contact the Super Administrator.',
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await logAudit({
      req,
      action: 'LOGIN_SUCCESS',
      entityType: 'AdminUser',
      entityId: user._id,
      details: `User ${user.email} (${user.role}) logged in`,
    });

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during authentication.',
    });
  }
};

export const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        lastLogin: req.user.lastLogin,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  res.clearCookie('adminToken');
  return res.status(200).json({
    success: true,
    message: 'Successfully logged out.',
  });
};

export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalProducts,
      publishedProducts,
      totalCities,
      publishedCities,
      verifiedCities,
      draftCities,
      cityProductsTotal,
      cityProductsPublished,
      totalEnquiries,
      newEnquiries,
      recentEnquiries,
      topCitiesAgg,
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ status: 'published' }),
      City.countDocuments(),
      City.countDocuments({ status: 'published' }),
      City.countDocuments({ isVerified: true }),
      City.countDocuments({ status: 'draft' }),
      CityProduct.countDocuments(),
      CityProduct.countDocuments({ status: 'published' }),
      Enquiry.countDocuments(),
      Enquiry.countDocuments({ status: 'new' }),
      Enquiry.find().sort({ createdAt: -1 }).limit(6).lean(),
      Enquiry.aggregate([
        { $match: { city: { $ne: '' } } },
        { $group: { _id: '$city', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        publishedProducts,
        totalCities,
        publishedCities,
        verifiedCities,
        draftCities,
        cityProductsTotal,
        cityProductsPublished,
        totalEnquiries,
        newEnquiries,
        recentEnquiries,
        topCities: topCitiesAgg.map((c) => ({ city: c._id, count: c.count })),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
