import { Request, Response } from 'express';

import User from '../../models/User.js';
import { loginUserSchema, registerUserSchema } from '../../schemas/user.schema.js';
import { createSecretToken } from '../../utils/generateToken.js';
import { handleControllerError } from '../../utils/handleError.js';

export const registerUser = async (req: Request, res: Response) => {
  try {
    const body = await registerUserSchema.shape.body.parseAsync(req.body);
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
      password,
    });

    res.status(201).json({ message: 'User signed up successfully' });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const body = await loginUserSchema.shape.body.parseAsync(req.body);
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

    res.status(200).json({
      message: 'User logged in successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        birthdate: user.birthdate,
        email: user.email,
        specialOffer: user.specialOffer,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
    });
  } catch (error) {
    handleControllerError(error, res);
  }
};
