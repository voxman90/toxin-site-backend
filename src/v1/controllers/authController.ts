import { Request, Response } from 'express';

import User from '../../models/User.js';
import { createSecretToken } from '../../utils/generateToken.js';

const registerUser = async (req: Request, res: Response) => {
  const {
    firstName,
    lastName,
    gender,
    birthdate,
    specialOffer,
    email,
    password,
  } = req.body;

  try {
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
    res.status(400).json({ message: 'Bad Request' });
  }
};

const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

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
    res.status(500).json({ message: 'Server error' });
  }
};

export {
  loginUser,
  registerUser,
};
