import jwt from 'jsonwebtoken';

import { Role } from '../@types/data.js';

const DEFAULT_EXPIRE_TIME = '8h';

const createSecretToken = (id: string, role: Role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET_KEY as string,
    { expiresIn: DEFAULT_EXPIRE_TIME },
  );
};

export { createSecretToken };
