import { Request, Response } from 'express';

import type { AuthorizedRequest } from '../../@types/express.js';
import type { GetUserResponseDTO } from '../../@types/user.js';
import type { ILeanUser } from '../../models/User.js';
import User from '../../models/User.js';
import { getUserSchema } from '../../schemas/user.schema.js';
import { handleControllerError } from '../../utils/handleError.js';
import { toUserDTO } from '../../utils/mappers.js';

export const getUser = async (req: Request, res: Response) => {
  try {
    const { params } = await getUserSchema.parseAsync({ params: req.params });
    const { id } = params;

    const user = await User.findById(id).select('-password').lean<ILeanUser>();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const responseData: GetUserResponseDTO = toUserDTO(user);

    res.status(200).json(responseData);
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

    const responseData: GetUserResponseDTO = toUserDTO(user);

    res.json(responseData);
  } catch (error) {
    handleControllerError(error, res);
  }
};
