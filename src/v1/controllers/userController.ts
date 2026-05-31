import { Request, Response } from 'express';

import type { AuthorizedRequest } from '../../@types/express.js';
import User from '../../models/User.js';

const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyProfile = async (req: AuthorizedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export {
  getMyProfile,
  getUserById,
};
