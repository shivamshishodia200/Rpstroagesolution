import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  getPublicHomepage,
  getPublicLocations,
  getPublicCityLanding,
  getPublicCityProductLanding,
  getPublicProducts,
  getPublicProductBySlug,
  submitPublicEnquiry,
} from '../controllers/publicController.js';
import { getCategories } from '../controllers/categoryController.js';
import { getStates } from '../controllers/stateController.js';

const router = express.Router();

const enquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 10,
  message: { success: false, message: 'Too many enquiry requests from this IP. Please try again later or call directly.' },
});

router.get('/homepage', getPublicHomepage);
router.get('/locations', getPublicLocations);
router.get('/locations/:citySlug', getPublicCityLanding);
router.get('/locations/:citySlug/:productSlug', getPublicCityProductLanding);
router.get('/products', getPublicProducts);
router.get('/products/:slug', getPublicProductBySlug);
router.get('/categories', getCategories);
router.get('/states', getStates);
router.post('/enquiries', enquiryLimiter, submitPublicEnquiry);

export default router;
