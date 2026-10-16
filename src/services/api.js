import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/public';

export const publicApi = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getHomepageData = async () => {
  const res = await publicApi.get('/homepage');
  return res.data;
};

export const getLocations = async () => {
  const res = await publicApi.get('/locations');
  return res.data;
};

export const getCityLanding = async (citySlug, params = {}) => {
  const res = await publicApi.get(`/locations/${citySlug}`, { params });
  return res.data;
};

export const getCityProductLanding = async (citySlug, productSlug, params = {}) => {
  const res = await publicApi.get(`/locations/${citySlug}/${productSlug}`, { params });
  return res.data;
};

export const getProducts = async (category = '') => {
  const res = await publicApi.get(`/products${category ? `?category=${category}` : ''}`);
  return res.data;
};

export const getProductBySlug = async (slug) => {
  const res = await publicApi.get(`/products/${slug}`);
  return res.data;
};

export const getCategories = async () => {
  const res = await publicApi.get('/categories');
  return res.data;
};

export const submitEnquiry = async (enquiryData) => {
  const res = await publicApi.post('/enquiries', enquiryData);
  return res.data;
};

export default {
  getHomepageData,
  getLocations,
  getCityLanding,
  getCityProductLanding,
  getProducts,
  getProductBySlug,
  getCategories,
  submitEnquiry,
};
