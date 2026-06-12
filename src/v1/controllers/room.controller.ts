import { Request, Response } from 'express';
import type { QueryFilter } from 'mongoose';

import type { GetRoomResponseDTO, RoomDTO, SearchRoomsResponseDTO } from '../../@types/room.js';
import type { ILeanRoom, IRoom } from '../../models/Room.js';
import Room from '../../models/Room.js';
import { getRoomByIdSchema, searchRoomsSchema } from '../../schemas/room.schema.js';
import { handleControllerError } from '../../utils/handleError.js';
import { toPaginatedRoomsDTO, toRoomDTO } from '../../utils/mappers.js';

export const searchRooms = async (req: Request, res: Response) => {
  try {
    const { query: queryData } = await searchRoomsSchema.parseAsync({ query: req.query });
    const {
      checkIn,
      checkOut,
      minPrice,
      maxPrice,
      guests: { adult, child },
      amenities: { bed, bedroom, bathroom },
      accessibility,
      rules,
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

    const totalGuests = adult + child;

    if (totalGuests > 0) {
      query.capacity = { $gte: totalGuests };
    }

    if (bed) query.bed = { $gte: bed };

    if (bedroom) query.bedroom = { $gte: bedroom };

    if (bathroom) query.bathroom = { $gte: bathroom };

    if (rules && rules.length > 0) {
      query.rules = { $all: rules };
    }

    if (accessibility && accessibility.length > 0) {
      query.accessibility = { $all: accessibility };
    }

    const aggregatedRoomsPromise = Room.aggregate([
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
      {
        $addFields: { id: { $toString: '$_id' } },
      },
      { $project: { conflictingBookings: 0 } },
      {
        $sort: { [sort]: order },
      },
    ]);

    const options = { page, limit };

    const aggregatedRooms = await Room.aggregatePaginate<RoomDTO>(aggregatedRoomsPromise, options);

    const responseData: SearchRoomsResponseDTO = toPaginatedRoomsDTO(aggregatedRooms);

    return res.status(200).json(responseData);
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const getRoomById = async (req: Request, res: Response) => {
  try {
    const { params } = await getRoomByIdSchema.parseAsync({ params: req.params });

    const room = await Room.findById(params.id).lean<ILeanRoom>();

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const responseData: GetRoomResponseDTO = toRoomDTO(room);

    res.status(200).json(responseData);
  } catch (error) {
    handleControllerError(error, res);
  }
};
