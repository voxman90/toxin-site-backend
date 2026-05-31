import { Request, Response } from 'express';

import { RoomQuery } from '../../@types/express.js';
import { DEFAULT_ROOMS_LIMIT, DEFAULT_ROOMS_SORT_ORDER } from '../../constants/constants.js';
import Room from '../../models/Room.js';

const getOrder = (order?: string) => (Number(order) === 1) ? 1 : -1;

const searchRooms = async (req: Request<{}, {}, {}, RoomQuery>, res: Response) => {
  try {
    const {
      checkIn,
      checkOut,
      minPrice,
      maxPrice,
      "guests[adult]": adultQuery,
      "guests[child]": childQuery,
      "amenities[bed]": bedQuery,
      "amenities[bedroom]": bedroomQuery,
      "amenities[bathroom]": bathroomQuery,
      "accessibility[]": accessibilityQuery,
      "rules[]": rulesQuery,
      sort,
      order,
      limit,
      page,
    } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({ message: 'Bad request' });
    }

    const query: any = { isAvailable: true };

    if (minPrice || maxPrice) {
      query.price = {}

      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const totalGuests = (Number(adultQuery) || 0) + (Number(childQuery) || 0);
    if (totalGuests > 0) {
      query.capacity = { $gte: totalGuests };
    }

    if (bedQuery) query.bed = { $gte: Number(bedQuery) };
    if (bedroomQuery) query.bedroom = { $gte: Number(bedroomQuery) };
    if (bathroomQuery) query.bathroom = { $gte: Number(bathroomQuery) };

    if (rulesQuery) {
      query.rules = { $all: Array.isArray(rulesQuery) ? rulesQuery : [rulesQuery] };
    }

    if (accessibilityQuery) {
      query.accessibility = {
        $all: Array.isArray(accessibilityQuery) ? accessibilityQuery : [accessibilityQuery],
      };
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    const aggregatedRooms =  Room.aggregate([
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
                    { $eq: ['$room' , '$$roomId']},
                    { $lt: ['$checkIn', checkOutDate] },
                    { $gt: ['$checkOut', checkInDate] },
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
        $sort: sort ? { [sort]: getOrder(order) } : DEFAULT_ROOMS_SORT_ORDER,
      },
    ]);

    const options = {
      page: Number(page) || 1,
      limit: Number(limit) || DEFAULT_ROOMS_LIMIT,
    };

    const result = await Room.aggregatePaginate(aggregatedRooms, options);

    return res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getRoomById = async (req: Request, res: Response) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: "Room not found "});
    }

    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export {
  getRoomById,
  searchRooms,
};
