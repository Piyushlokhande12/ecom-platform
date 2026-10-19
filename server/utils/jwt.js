import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';

export const signToken = (payload, expiresIn = '7d') => {
  return jwt.sign(payload, ENV.JWT_SECRET, { expiresIn });
};

export const verifyToken = (token) => {
  return jwt.verify(token, ENV.JWT_SECRET);
};
