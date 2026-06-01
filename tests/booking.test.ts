import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import type { BookingPreview } from '../src/@types/data.js';
import app from '../src/app.js';
import Booking from '../src/models/Booking.js';
import Room from '../src/models/Room.js';
import Service from '../src/models/Service.js';
import User from '../src/models/User.js';
import { roomFixtures } from './fixtures/room.fixture.js';
import { serviceFixtures } from './fixtures/service.fixture.js';
import { validUserData } from './fixtures/user.fixture.js';
import { getAuthHeader } from './utils/auth.js';

describe('Bookings API (Integration)', () => {
  let testUser: any;
  let targetRoom: any;
  let authHeader: any;

  beforeEach(async () => {
    await Room.create(roomFixtures[0]);

    targetRoom = await Room.findOne({ roomNumber: 101 });
    testUser = await User.create(validUserData);
    authHeader = getAuthHeader(testUser._id, testUser.role);

    await Service.create(serviceFixtures);
  });

  describe('POST /api/v1/bookings/:roomId/preview', () => {
    it('should return 200 and pricing details', async () => {
      const res = await request(app)
        .post(`/api/v1/bookings/${targetRoom._id.toString()}/preview`)
        .send({
          checkIn: '2030-07-01T00:00:00Z',
          checkOut: '2030-07-05T00:00:00Z',
          'guests[adult]': '1',
          'additionalServices[]': ['crib', 'TV'],
        });

      const bookingPreview: BookingPreview = {
        nights: 4,
        discount: 0,
        pricePerNight: 10000,
        basePrice: 40000,
        servicePrice: 0,
        additionalServicePrice: 2500,
        additionalServiceSummary: {
          crib: 1500,
          TV: 1000,
        },
        totalPrice: 42500,
      };

      expect(res.status).toBe(200);
      expect(res.body).toEqual(bookingPreview);
    });

    it('should return 400 when dates are not in ISO format', async () => {
      const res = await request(app)
        .post(`/api/v1/bookings/${targetRoom._id.toString()}/preview`)
        .send({
          checkIn: '2030-07-01T00:00:00Z',
          checkOut: '2030-07-05',
          'guests[adult]': '1',
        });

      expect(res.status).toBe(400);
      expect(res.body.errors[0].field).toBe('checkOut');
      expect(res.body.errors[0].message).toBe('Check-out date must be a UTC ISO string (ending with Z)');
    });

    it('should return 400 when additional services contain unexpected values', async () => {
      const res = await request(app)
        .post(`/api/v1/bookings/${targetRoom._id.toString()}/preview`)
        .send({
          checkIn: '2030-07-01T00:00:00Z',
          checkOut: '2030-07-05T00:00:00Z',
          'guests[adult]': '1',
          'additionalServices[]': ['Wololo!'],
        });

      expect(res.status).toBe(400);
      expect(res.body.errors[0].field).toBe('additionalServices[].0');
      expect(res.body.errors[0].message).toBe('Invalid service name');
    });

    it('should return 400 when check-out date is before or equal to check-in date', async () => {
      const res = await request(app)
        .post(`/api/v1/bookings/${targetRoom._id.toString()}/preview`)
        .send({
          checkIn: '2030-06-27T00:00:00Z',
          checkOut: '2030-06-26T00:00:00Z',
          'guests[adult]': '1',
        });

      expect(res.status).toBe(400);
      expect(res.body.errors[0].field).toBe('checkOut');
      expect(res.body.errors[0].message).toBe('Check-out date must be after check-in date');
    });
  });

  describe('POST /api/v1/rooms/:roomId/create', () => {
    it('should successfully create a new booking when room is available', async () => {
      const res = await request(app)
        .post(`/api/v1/bookings/${targetRoom._id.toString()}/confirm`)
        .set(authHeader)
        .send({
          checkIn: '2030-07-01T00:00:00Z',
          checkOut: '2030-07-05T00:00:00Z',
          'guests[adult]': '1',
          'additionalServices[]': ['crib', 'TV'],
        });

      expect(res.status).toBe(201);

      const createdBooking = await Booking.findOne({ user: testUser._id });

      expect(createdBooking?.toObject()).toMatchObject({
        user: testUser._id,
        room: targetRoom._id,
        guests: {
          adult: 1,
          child: 0,
          baby: 0,
        },
        checkIn: new Date('2030-07-01T00:00:00Z'),
        checkOut: new Date('2030-07-05T00:00:00Z'),
        additionalServices: ['crib', 'TV'],
        priceSummary: {
          nights: 4,
          discount: 0,
          pricePerNight: 10000,
          basePrice: 40000,
          servicePrice: 0,
          additionalServicePrice: 2500,
          additionalServiceSummary: new Map([
            ['crib', 1500],
            ['TV', 1000],
          ]),
          totalPrice: 42500,
        }
      });
    });

    it('should return 400 when trying to book overlapping dates', async () => {
      await request(app)
        .post(`/api/v1/bookings/${targetRoom._id.toString()}/confirm`)
        .set(authHeader)
        .send({
          checkIn: '2030-07-01T00:00:00Z',
          checkOut: '2030-07-05T00:00:00Z',
          'guests[adult]': '1',
        });

      const res = await request(app)
        .post(`/api/v1/bookings/${targetRoom._id.toString()}/confirm`)
        .set(authHeader)
        .send({
          checkIn: '2030-07-03T00:00:00Z',
          checkOut: '2030-07-09T00:00:00Z',
          'guests[adult]': '1',
        });

      expect(res.status).toBe(400);

      const resTwo = await request(app)
        .post(`/api/v1/bookings/${targetRoom._id.toString()}/confirm`)
        .set(authHeader)
        .send({
          checkIn: '2030-06-28T00:00:00Z',
          checkOut: '2030-07-02T00:00:00Z',
          'guests[adult]': '1',
        });

      expect(resTwo.status).toBe(400);

      const resThree = await request(app)
        .post(`/api/v1/bookings/${targetRoom._id.toString()}/confirm`)
        .set(authHeader)
        .send({
          checkIn: '2030-06-28T00:00:00Z',
          checkOut: '2030-07-28T00:00:00Z',
          'guests[adult]': '1',
        });

      expect(resThree.status).toBe(400);

      const resFour = await request(app)
        .post(`/api/v1/bookings/${targetRoom._id.toString()}/confirm`)
        .set(authHeader)
        .send({
          checkIn: '2030-07-02T00:00:00Z',
          checkOut: '2030-07-04T00:00:00Z',
          'guests[adult]': '1',
        });

      expect(resFour.status).toBe(400);
    });

    it('should return 401 if user is not authenticated', async () => {
      const res = await request(app)
        .post(`/api/v1/bookings/${targetRoom._id.toString()}/confirm`)
        .send({
          checkIn: '2030-07-01T00:00:00Z',
          checkOut: '2030-07-05T00:00:00Z',
          'guests[adult]': '1',
        });

      expect(res.status).toBe(401);
    });
  });
});
