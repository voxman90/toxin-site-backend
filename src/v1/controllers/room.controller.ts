import { Request, Response } from 'express';
import type { QueryFilter } from 'mongoose';

import type { IRoom } from '../../models/Room.js';
import Room from '../../models/Room.js';
import { getRoomByIdSchema, searchRoomsSchema } from '../../schemas/room.schema.js';
import { handleControllerError } from '../../utils/handleError.js';

export const searchRooms = async (req: Request, res: Response) => {
  try {
    const queryData = await searchRoomsSchema.parseAsync(req.query);
    const {
      checkIn,
      checkOut,
      minPrice,
      maxPrice,
      'guests[adult]': adultQuery,
      'guests[child]': childQuery,
      'amenities[bed]': bedQuery,
      'amenities[bedroom]': bedroomQuery,
      'amenities[bathroom]': bathroomQuery,
      'accessibility[]': accessibilityQuery,
      'rules[]': rulesQuery,
      sort,
      order,
      limit,
      page,
    } = queryData;

    const query: QueryFilter<IRoom> = { isAvailable: true };

    if (minPrice || maxPrice) {
      query.price = {};

      if (minPrice) query.price.$gte = minPrice;

      if (maxPrice) query.price.$lte = maxPrice;
    }

    const totalGuests = adultQuery + childQuery;

    if (totalGuests > 0) {
      query.capacity = { $gte: totalGuests };
    }

    if (bedQuery) query.bed = { $gte: bedQuery };

    if (bedroomQuery) query.bedroom = { $gte: bedroomQuery };

    if (bathroomQuery) query.bathroom = { $gte: bathroomQuery };

    if (rulesQuery) {
      query.rules = { $all: rulesQuery };
    }

    if (accessibilityQuery) {
      query.accessibility = { $all: accessibilityQuery };
    }

    const aggregatedRooms = Room.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'bookings',
          let: { roomId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$room', '$$roomId'] },
                    { $lte: ['$checkIn', checkOut] },
                    { $gte: ['$checkOut', checkIn] },
                  ],
                },
              },
            },
          ],
          as: 'conflictingBookings',
        },
      },
      { $match: { conflictingBookings: { $size: 0 } } },
      { $project: { conflictingBookings: 0 } },
      {
        $sort: { [sort]: order },
      },
    ]);

    const options = { page, limit };

    const result = await Room.aggregatePaginate(aggregatedRooms, options);

    return res.status(200).json(result);
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const getRoomById = async (req: Request, res: Response) => {
  try {
    const params = await getRoomByIdSchema.parseAsync(req.params);

    const room = await Room.findById(params.id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.status(200).json(room);
  } catch (error) {
    handleControllerError(error, res);
  }
};
