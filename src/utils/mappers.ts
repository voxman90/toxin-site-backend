import type { AggregatePaginateResult } from 'mongoose';

import type { BookingDTO, PriceSummaryDTO } from '../@types/booking.js';
import type { PaginatedReviewsDTO, ReviewDTO } from '../@types/review.js';
import type { PaginatedRoomsDTO, RoomDTO } from '../@types/room.js';
import type { UserDTO } from '../@types/user.js';
import type { IBooking, ILeanBooking } from '../models/Booking.js';
import type { ILeanRoom } from '../models/Room.js';
import type { ILeanUser } from '../models/User.js';

export const toRoomDTO = (room: ILeanRoom): RoomDTO => {
  return {
    id: room._id.toString(),
    roomNumber: room.roomNumber,
    isLuxe: room.isLuxe,
    price: room.price,
    capacity: room.capacity,
    bed: room.bed,
    bedroom: room.bedroom,
    bathroom: room.bathroom,
    isAvailable: room.isAvailable,
    avgRating: room.avgRating,
    reviewsCount: room.reviewsCount,
    images: room.images,
    accessibility: room.accessibility,
    rules: room.rules,
    createdAt: room.createdAt.toISOString(),
    updatedAt: room.updatedAt.toISOString(),
  };
};

export const toUserDTO = (user: ILeanUser): UserDTO => {
  return {
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    gender: user.gender,
    birthdate: user.birthdate,
    email: user.email,
    specialOffer: user.specialOffer ?? false,
    avatarUrl: user.avatarUrl ?? '',
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
};

export const toPriceSummaryDTO = (summary: IBooking['priceSummary']): PriceSummaryDTO => {
  return {
    nights: summary.nights,
    discount: summary.discount,
    pricePerNight: summary.pricePerNight,
    basePrice: summary.basePrice,
    servicePrice: summary.servicePrice,
    additionalServicePrice: summary.additionalServicePrice,
    additionalServiceSummary: summary.additionalServiceSummary,
    totalPrice: summary.totalPrice,
  };
};

export const toBookingDTO = (booking: ILeanBooking): BookingDTO => {
  return {
    id: booking._id.toString(),
    user: booking.user.toString(),
    room: booking.room.toString(),
    checkIn: booking.checkIn.toISOString(),
    checkOut: booking.checkOut.toISOString(),
    guests: {
      adult: booking.guests.adult ?? 0,
      child: booking.guests.child ?? 0,
      baby: booking.guests.baby ?? 0,
    },
    additionalServices: booking.additionalServices,
    priceSummary: toPriceSummaryDTO(booking.priceSummary),
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
  };
};

export const toPaginatedReviewsDTO = (
  aggregatedReviews: AggregatePaginateResult<ReviewDTO>,
): PaginatedReviewsDTO => {
  return {
    docs: aggregatedReviews.docs,
    totalDocs: aggregatedReviews.totalDocs,
    limit: aggregatedReviews.limit,
    page: aggregatedReviews.page ?? 1,
    totalPages: aggregatedReviews.totalPages,
    pagingCounter: aggregatedReviews.pagingCounter,
    hasPrevPage: aggregatedReviews.hasPrevPage,
    hasNextPage: aggregatedReviews.hasNextPage,
    prevPage: aggregatedReviews.nextPage ?? null,
    nextPage: aggregatedReviews.prevPage ?? null,
  };
};

export const toPaginatedRoomsDTO = (
  aggregatedRooms: AggregatePaginateResult<RoomDTO>,
): PaginatedRoomsDTO => {
  return {
    docs: aggregatedRooms.docs,
    totalDocs: aggregatedRooms.totalDocs,
    limit: aggregatedRooms.limit,
    page: aggregatedRooms.page ?? 1,
    totalPages: aggregatedRooms.totalPages,
    pagingCounter: aggregatedRooms.pagingCounter,
    hasPrevPage: aggregatedRooms.hasPrevPage,
    hasNextPage: aggregatedRooms.hasNextPage,
    prevPage: aggregatedRooms.nextPage ?? null,
    nextPage: aggregatedRooms.prevPage ?? null,
  };
};
