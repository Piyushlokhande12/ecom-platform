import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 3001,
  DATABASE_URL: process.env.DATABASE_URL || process.env.DB_URL,
  JWT_SECRET: process.env.JWT_SECRET || 'ecomm_jwt_secret_token_secure_key_998811',
  NODE_ENV: process.env.NODE_ENV || 'development'
};
