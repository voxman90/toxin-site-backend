import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';

import type { Role } from '../@types/data.js';
import type { AuthorizedRequest } from '../@types/express.js';
import User from '../models/User.js';

export const protect = (isOptional = false) => {
  return async (req: AuthorizedRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      if (isOptional) return next();

      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as { id: string };
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        throw new Error('User not found');
      }

      req.user = user;
      next();
    } catch {
      if (isOptional) return next();

      res.status(401).json({ message: 'Invalid token' });
    }
  };
};

export const authorize = (role: Role) => {
  return async (req: AuthorizedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.user.role !== role) {
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }

    next();
  };
};
