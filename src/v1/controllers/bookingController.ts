import { Request, Response } from 'express';
import { Types } from 'mongoose';

import { AdditionalService } from '../../@types/data.js';
import type { AuthorizedRequest } from '../../@types/express.js';
import Booking from '../../models/Booking.js';
import Room from '../../models/Room.js';
import Service from '../../models/Service.js';

interface CalculateBookingPreviewParams {
  checkIn: string;
  checkOut: string;
  additionalServices: AdditionalService[];
  pricePerNight: number;
}

const calculateBookingPreview = async ({
  checkIn,
  checkOut,
  additionalServices,
  pricePerNight,
}: CalculateBookingPreviewParams) => {
  const nights = Booking.calculateNights(new Date(checkIn), new Date(checkOut));

  const servicePrice = 0;
  const discount = 0;
  const {
    totalPrice: additionalServicePrice,
    summary: additionalServiceSummary,
  } = await Service.calculateAdditionalServicePrice(additionalServices);

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

const getBookingPreview = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { checkIn, checkOut, additionalServices = [] } = req.body;

    const room = await Room.findById(roomId);

    if (!checkIn || !checkOut) {
      return res.status(400).json({ message: 'Bad request' });
    }

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const bookingPreview = await calculateBookingPreview({
      checkIn,
      checkOut,
      pricePerNight: room.price,
      additionalServices,
    });

    return res.status(200).json(bookingPreview);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

const createBooking = async (
  req: AuthorizedRequest<{ roomId: string }>,
  res: Response,
) => {
  try {
    const { roomId } = req.params;
    const { checkIn, checkOut, additionalServices } = req.body;
    const { user } = req;

    if (!checkIn || !checkOut) {
      return res.status(400).json({ message: 'Bad request: checkIn and checkOut are required' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userId = user._id;

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    const isOverlapping = await Booking.findOne({
      room: roomId,
      checkIn: { $lt: checkOutDate },
      checkOut: { $gt: checkInDate },
    });

    if (isOverlapping) {
      return res.status(400).json({ message: 'Room already booked for these dates' });
    }

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const priceSummary = await calculateBookingPreview({
      checkIn,
      checkOut,
      additionalServices,
      pricePerNight: room.price,
    });

    const roomObjectId = new Types.ObjectId(roomId);
    const newBooking = await Booking.create({
      user: userId,
      room: roomObjectId,
      checkIn,
      checkOut,
      additionalServices,
      priceSummary,
    });

    res.status(201).json(newBooking);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export {
  createBooking,
  getBookingPreview,
};
