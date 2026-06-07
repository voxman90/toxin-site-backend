import { Request } from 'express';

import type { ILeanUser } from '../models/User.js';

export interface AuthorizedRequest<
  P = Record<string, string>,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = unknown,
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: ILeanUser;
  headers: { authorization?: string };
}
