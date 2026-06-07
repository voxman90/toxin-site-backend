import { Request, Response } from 'express';
import { Types } from 'mongoose';

import type {
  CreateBookingResponseDTO,
  GetPriceSummaryDTO,
  PriceSummaryDTO,
} from '../../@types/booking.js';
import type { AdditionalService } from '../../@types/data.js';
import type { AuthorizedRequest } from '../../@types/express.js';
import Booking, { type ILeanBooking } from '../../models/Booking.js';
import Room from '../../models/Room.js';
import Service from '../../models/Service.js';
import { createBookingSchema, getPriceSummarySchema } from '../../schemas/booking.schema.js';
import { handleControllerError } from '../../utils/handleError.js';
import { toBookingDTO } from '../../utils/mappers.js';

interface CalculatePriceSummaryProps {
  checkIn: Date;
  checkOut: Date;
  additionalServices: AdditionalService[];
  pricePerNight: number;
}

const calculatePriceSummary = async ({
  checkIn,
  checkOut,
  additionalServices,
  pricePerNight,
}: CalculatePriceSummaryProps): Promise<PriceSummaryDTO> => {
  const nights = Booking.calculateNights(checkIn, checkOut);
  const servicePrice = 0;
  const discount = 0;
  const { totalPrice: additionalServicePrice, summary: additionalServiceSummary } =
    await Service.calculateServicePrice(additionalServices);
  const { totalPrice, basePrice } = Booking.calculateTotalPrice({
    nights,
    servicePrice,
    additionalServicePrice,
    pricePerNight,
    discount,
  });

  return {
    nights,
    discount,
    pricePerNight,
    basePrice,
    servicePrice,
    additionalServicePrice,
    additionalServiceSummary,
    totalPrice,
  };
};

export const getPriceSummary = async (req: Request, res: Response) => {
  try {
    const { params, body } = await getPriceSummarySchema.parseAsync({
      params: req.params,
      body: req.body,
    });
    const { roomId } = params;
    const { checkIn, checkOut, additionalServices } = body;

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const priceSummary = await calculatePriceSummary({
      checkIn,
      checkOut,
      pricePerNight: room.price,
      additionalServices,
    });

    const responseData: GetPriceSummaryDTO = priceSummary;

    return res.status(200).json(responseData);
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const createBooking = async (req: AuthorizedRequest, res: Response) => {
  try {
    const { params, body } = await createBookingSchema.parseAsync({
      params: req.params,
      body: req.body,
    });
    const { roomId } = params;
    const {
      checkIn,
      checkOut,
      guests: { adult, child, baby },
      additionalServices,
    } = body;
    const { user } = req;
    const userId = user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const isOverlapping = await Booking.findOne({
      room: roomId,
      checkIn: { $lte: checkOut },
      checkOut: { $gte: checkIn },
    });

    if (isOverlapping) {
      return res.status(400).json({ message: 'Room already booked for these dates' });
    }

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const priceSummary = await calculatePriceSummary({
      checkIn,
      checkOut,
      additionalServices,
      pricePerNight: room.price,
    });

    const newBooking = await Booking.create({
      user: userId,
      room: new Types.ObjectId(roomId),
      checkIn,
      checkOut,
      guests: { adult, child, baby },
      additionalServices,
      priceSummary,
    });

    const responseData: CreateBookingResponseDTO = toBookingDTO(
      newBooking as unknown as ILeanBooking,
    );

    res.status(201).json(responseData);
  } catch (error) {
    handleControllerError(error, res);
  }
};
