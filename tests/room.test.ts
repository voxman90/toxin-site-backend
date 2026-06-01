import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import app from '../src/app.js';
import Booking from '../src/models/Booking.js';
import Room from '../src/models/Room.js';
import User from '../src/models/User.js';
import { roomFixtures } from './fixtures/room.fixture.js';
import { invalidObjectId, validObjectId } from './fixtures/shared.js';
import { validUserData } from './fixtures/user.fixture.js';

describe('Rooms API (Integration)', () => {
  beforeEach(async () => {
    await Room.create(roomFixtures);
  });

  describe('GET /api/v1/rooms/search', () => {
    it('should return 200 and list of filtered rooms when query is valid', async () => {
      const res = await request(app)
        .get('/api/v1/rooms/search')
        .query({
          checkIn: '2030-06-01T00:00:00Z',
          checkOut: '2030-06-02T00:00:00Z',
          minPrice: '10000',
          maxPrice: '10000',
        });

      expect(res.status).toBe(200);
      expect(res.body.docs.length).toBe(1);
      expect(res.body.docs[0].roomNumber).toBe(101);
    });

    it('should ignore unavailable rooms (isAvailable: false) by default', async () => {
      const res = await request(app)
        .get('/api/v1/rooms/search')
        .query({
          checkIn: '2030-06-01T00:00:00Z',
          checkOut: '2030-06-02T00:00:00Z',
          minPrice: '14000',
        });

      expect(res.status).toBe(200);
      expect(res.body.docs.length).toBe(0);
    });

    it('should correctly sort rooms by sort and in order', async () => {
      const res = await request(app)
        .get('/api/v1/rooms/search')
        .query({
          checkIn: '2030-06-01T00:00:00Z',
          checkOut: '2030-06-02T00:00:00Z',
          sort: 'price',
          order: '-1',
        });

      expect(res.status).toBe(200);
      expect(res.body.docs.length).toBe(3);
      expect(res.body.docs[0].price).toBe(10000);
      expect(res.body.docs[1].price).toBe(5000);
      expect(res.body.docs[2].price).toBe(3000);
    });

    it('should return 400 when mandatory checkIn or checkOut dates are missing', async () => {
      const res = await request(app)
        .get('/api/v1/rooms/search')
        .query({ checkOut: '2030-06-02T00:00:00Z' });

      expect(res.status).toBe(400);
      expect(res.body.errors[0].field).toBe('checkIn');
    });

    it('should return 400 when checkOut date is before checkIn date', async () => {
      const res = await request(app)
        .get('/api/v1/rooms/search')
        .query({
          checkIn: '2031-06-01T00:00:00Z',
          checkOut: '2030-06-02T00:00:00Z',
        });

      expect(res.status).toBe(400);
      expect(res.body.errors[0].field).toBe('checkOut');
    });

    it('should return 400 when numerical search queries receive text', async () => {
      const res = await request(app)
        .get('/api/v1/rooms/search')
        .query({
          checkIn: '2030-06-01T00:00:00Z',
          checkOut: '2030-06-02T00:00:00Z',
          minPrice: 'Wololo!',
        });

      expect(res.status).toBe(400);
      expect(res.body.errors[0].field).toBe('minPrice');
    });

    it('should return 400 when sort option are invalid', async () => {
      const res = await request(app)
        .get('/api/v1/rooms/search')
        .query({
          checkIn: '2030-06-01T00:00:00Z',
          checkOut: '2030-06-02T00:00:00Z',
          sort: 'Wololo!',
        });

      expect(res.status).toBe(400);
      expect(res.body.errors[0].field).toBe('sort');
    });

    it('should correctly filter rooms by capacity (adults + children)', async () => {
      const res = await request(app)
        .get('/api/v1/rooms/search')
        .query({
          checkIn: '2030-06-01T00:00:00Z',
          checkOut: '2030-06-02T00:00:00Z',
          'guests[child]': '2',
          'guests[adult]': '2',
          sort: 'roomNumber',
        });

      expect(res.status).toBe(200);
      expect(res.body.docs.length).toBe(2);
      expect(res.body.docs[0].roomNumber).toBe(101);
      expect(res.body.docs[1].roomNumber).toBe(102);
    });

    it('should correctly filter rooms by amenities', async () => {
      const res = await request(app)
        .get('/api/v1/rooms/search')
        .query({
          checkIn: '2030-06-01T00:00:00Z',
          checkOut: '2030-06-02T00:00:00Z',
          'amenities[bed]': '4',
          'amenities[bedroom]': '2',
          'amenities[bathroom]': '1',
          sort: 'roomNumber',
        });

      expect(res.status).toBe(200);
      expect(res.body.docs.length).toBe(1);
      expect(res.body.docs[0].roomNumber).toBe(101);
    });

    it('should correctly filter rooms by accessibility', async () => {
      const res = await request(app)
        .get('/api/v1/rooms/search')
        .query({
          checkIn: '2030-06-01T00:00:00Z',
          checkOut: '2030-06-02T00:00:00Z',
          'accessibility[]': ['wideCorridor', 'assistant'],
          sort: 'roomNumber',
        });

      expect(res.status).toBe(200);
      expect(res.body.docs.length).toBe(1);
      expect(res.body.docs[0].roomNumber).toBe(101);
    });

    it('should correctly filter rooms by rules', async () => {
      const res = await request(app)
        .get('/api/v1/rooms/search')
        .query({
          checkIn: '2030-06-01T00:00:00Z',
          checkOut: '2030-06-02T00:00:00Z',
          'rules[]': 'petsAllowed',
          sort: 'roomNumber',
        });

      expect(res.status).toBe(200);
      expect(res.body.docs.length).toBe(2);
      expect(res.body.docs[0].roomNumber).toBe(101);
      expect(res.body.docs[1].roomNumber).toBe(103);
    });

    it('should apply pagination parameters (page and limit) correctly', async () => {
      const firstPage = await request(app)
        .get('/api/v1/rooms/search')
        .query({
          checkIn: '2030-06-01T00:00:00Z',
          checkOut: '2030-06-02T00:00:00Z',
          sort: 'roomNumber',
          page: 1,
          limit: 2,
        });

      expect(firstPage.status).toBe(200);
      expect(firstPage.body.docs.length).toBe(2);
      expect(firstPage.body.totalDocs).toBe(3);
      expect(firstPage.body.page).toBe(1);
      expect(firstPage.body.docs[0].roomNumber).toBe(101);
      expect(firstPage.body.docs[1].roomNumber).toBe(102);

      const secondPage = await request(app)
        .get('/api/v1/rooms/search')
        .query({
          checkIn: '2030-06-01T00:00:00Z',
          checkOut: '2030-06-02T00:00:00Z',
          sort: 'roomNumber',
          page: 2,
          limit: 2,
        });

      expect(secondPage.status).toBe(200);
      expect(secondPage.body.docs.length).toBe(1);
      expect(secondPage.body.page).toBe(2);
      expect(secondPage.body.docs[0].roomNumber).toBe(103);
    });

    it('should exclude rooms that have conflicting bookings for the requested dates', async () => {
      const room101 = await Room.findOne({ roomNumber: 101 });

      await User.create(validUserData);

      const testUser = await User.findOne({ email: validUserData.email });

      await Booking.create({
        room: room101?._id,
        user: testUser?._id,
        checkIn: '2030-06-01T00:00:00Z',
        checkOut: '2030-06-10T00:00:00Z',
        guests: { adult: 1 },
        priceSummary: {
          nights: 1,
          discount: 0,
          pricePerNight: 10000,
          basePrice: 10000,
          servicePrice: 0,
          additionalServicePrice: 0,
          additionalServiceSummary: {},
          totalPrice: 10000,
        },
        additionalServices: [],
      });

      const res = await request(app)
        .get('/api/v1/rooms/search')
        .query({
          checkIn: '2030-06-10T00:00:00Z',
          checkOut: '2030-06-11T00:00:00Z',
          sort: 'roomNumber',
        });

      expect(res.status).toBe(200);
      expect(res.body.docs.length).toBe(2);
      expect(res.body.docs[0].roomNumber).toBe(102);
      expect(res.body.docs[1].roomNumber).toBe(103);
    });
  });

  describe('GET /api/v1/rooms/:id', () => {
    it('should return 200 and room details for a valid room ID', async () => {
      const room101 = await Room.findOne({ roomNumber: 101 });

      const res = await request(app)
        .get(`/api/v1/rooms/${room101?._id.toString()}`);

      expect(res.status).toBe(200);
      expect(res.body.roomNumber).toBe(101);
    });

    it('should return 400 when room ID format is invalid', async () => {
      const res = await request(app)
        .get(`/api/v1/rooms/${invalidObjectId}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Bad request');
    });

    it('should return 404 when room is not found', async () => {
      const res = await request(app)
        .get(`/api/v1/rooms/${validObjectId}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Room not found');
    });
  });
});
