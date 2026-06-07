import { Request, Response } from 'express';

import type { LoginResponseDTO, RegisterResponseDTO } from '../../@types/user.js';
import { ROLES } from '../../constants/constants.js';
import type { ILeanUser } from '../../models/User.js';
import User from '../../models/User.js';
import { loginSchema, registerSchema } from '../../schemas/user.schema.js';
import { createSecretToken } from '../../utils/generateToken.js';
import { handleControllerError } from '../../utils/handleError.js';
import { toUserDTO } from '../../utils/mappers.js';

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { body } = await loginSchema.parseAsync({ body: req.body });
    const { email, password } = body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = createSecretToken(user._id.toString(), user.role);

    const responseData: LoginResponseDTO = {
      message: 'User logged in successfully',
      token,
      user: toUserDTO(user as unknown as ILeanUser),
    };

    res.status(200).json(responseData);
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { body } = await registerSchema.parseAsync({ body: req.body });
    const { firstName, lastName, gender, birthdate, specialOffer, email, password } = body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    await User.create({
      firstName,
      lastName,
      gender,
      birthdate,
      specialOffer,
      email,
      role: ROLES.user,
      password,
    });

    const responseData: RegisterResponseDTO = { message: 'User signed up successfully' };

    res.status(201).json(responseData);
  } catch (error) {
    handleControllerError(error, res);
  }
};
