import { Request, Response } from 'express';

import type { AuthorizedRequest } from '../../@types/express.js';
import User from '../../models/User.js';
import { getUserByIdSchema } from '../../schemas/user.schema.js';
import { handleControllerError } from '../../utils/handleError.js';

export const getUserById = async (req: Request, res: Response) => {
  try {
    const params = await getUserByIdSchema.shape.params.parseAsync(req.params);
    const { id } = params;

    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const getMyProfile = async (req: AuthorizedRequest, res: Response) => {
  try {
    const { user } = req;

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    res.json(user);
  } catch (error) {
    handleControllerError(error, res);
  }
};
