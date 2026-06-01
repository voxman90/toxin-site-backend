import jwt from 'jsonwebtoken';
import type { Types } from 'mongoose';

import type { Role } from '../../src/@types/data.js';

export const getAuthHeader = (userId: Types.ObjectId, role: Role): { Authorization: string } => {
  const secret = process.env.JWT_SECRET_KEY || 'test-secret';

  const token = jwt.sign({ id: userId.toString(), role }, secret, { expiresIn: '1h' });

  return { Authorization: `Bearer ${token}` };
};
