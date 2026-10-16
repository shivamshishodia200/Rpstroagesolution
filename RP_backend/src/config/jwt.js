import dotenv from 'dotenv';
dotenv.config();

/**
 * Validated JWT Secret Management
 * Ensures JWT_SECRET is never insecurely defaulted in production environments.
 */
export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!secret) {
    if (isProduction) {
      throw new Error('[Security Error] FATAL: JWT_SECRET environment variable is required in production.');
    }
    console.warn('[Security Warning] JWT_SECRET is not set in environment. Using development secret.');
    return 'dev_rp_storage_development_only_secret_key_2026_xyz';
  }

  if (secret.length < 32) {
    if (isProduction) {
      throw new Error('[Security Error] FATAL: JWT_SECRET must be at least 32 characters in production.');
    }
    console.warn('[Security Warning] JWT_SECRET is shorter than 32 characters.');
  }

  return secret;
};

export const JWT_SECRET = getJwtSecret();
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
