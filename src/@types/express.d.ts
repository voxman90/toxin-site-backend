import { Request } from 'express';
import { HydratedDocument } from 'mongoose';

import type { IUser } from '../models/User.js';

export interface AuthorizedRequest<
  P = Record<string, string>,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: HydratedDocument<IUser>;
  headers: { authorization?: string };
}

export interface RoomQuery {
  minPrice?: string;
  maxPrice?: string;
  bed?: string;
  "guests[adult]": string,
  "guests[child]": string,
  "amenities[bed]": string,
  "amenities[bedroom]": string,
  "amenities[bathroom]": string,
  "accessibility[]"?: string[];
  "rules[]"?: string[];
  checkIn: string;
  checkOut: string;
  sort?: string;
  order?: string;
  limit?: string;
  page?: string;
}
