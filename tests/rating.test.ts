import type { HydratedDocument } from 'mongoose';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import app from '../src/app.js';
import Rating from '../src/models/Rating.js';
import Room from '../src/models/Room.js';
import type { IUser } from '../src/models/User.js';
import User from '../src/models/User.js';

import { roomFixtures } from './fixtures/room.fixture.js';
import { validObjectId } from './fixtures/shared.js';
import { userFixtures } from './fixtures/user.fixture.js';
import { getAuthHeader } from './utils/auth.js';

describe('Ratings API (Integration)', () => {
  let testUser: HydratedDocument<IUser>;
  let users: HydratedDocument<IUser>[];
  let targetRoom: any;
  let authHeader: any;

  beforeEach(async () => {
    await Room.create(roomFixtures);
    targetRoom = await Room.findOne({ roomNumber: 101 });

    users = await User.create(userFixtures);
    testUser = users[0];
    authHeader = getAuthHeader(testUser._id, testUser.role);
  });

  describe('POST /api/v1/ratings/:roomId', () => {
    it('should submit a rating successfully and update room avgRating', async () => {
      const res = await request(app)
        .post(`/api/v1/ratings/${targetRoom._id.toString()}`)
        .set(authHeader)
        .send({ score: 5 });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Rating saved successfully');

      const rating = await Rating.findOne({ user: testUser._id, room: targetRoom._id });
      expect(rating).toBeTruthy();
      expect(rating?.score).toBe(5);

      const updatedRoom = await Room.findById(targetRoom._id);
      expect(updatedRoom?.avgRating).toBe(5);
    });

    it('should return 400 when score violates Zod validations', async () => {
      const floatRes = await request(app)
        .post(`/api/v1/ratings/${targetRoom._id.toString()}`)
        .set(authHeader)
        .send({ score: 4.5 });

      expect(floatRes.status).toBe(400);
      expect(floatRes.body.status).toBe('fail');
      expect(floatRes.body.errors[0].field).toBe('score');
      expect(floatRes.body.errors[0].message).toBe('Score must be an integer');

      const highRes = await request(app)
        .post(`/api/v1/ratings/${targetRoom._id.toString()}`)
        .set(authHeader)
        .send({ score: 6 });

      expect(highRes.status).toBe(400);
      expect(highRes.body.status).toBe('fail');
      expect(highRes.body.errors[0].field).toBe('score');
      expect(highRes.body.errors[0].message).toBe('Score cannot be greater than 5');
    });

    it('should update the rating when user rates the same room', async () => {
      await request(app)
        .post(`/api/v1/ratings/${targetRoom._id.toString()}`)
        .set(authHeader)
        .send({ score: 4 });

      const res = await request(app)
        .post(`/api/v1/ratings/${targetRoom._id.toString()}`)
        .set(authHeader)
        .send({ score: 5 });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Rating saved successfully');

      const ratingsCount = await Rating.countDocuments({
        user: testUser._id,
        room: targetRoom._id,
      });
      expect(ratingsCount).toBe(1);

      const rating = await Rating.findOne({ user: testUser._id, room: targetRoom._id });
      expect(rating?.score).toBe(5);

      const updatedRoom = await Room.findById(targetRoom._id);
      expect(updatedRoom?.avgRating).toBe(5);
    });

    it('should return 401 if user is not authenticated', async () => {
      const res = await request(app)
        .post(`/api/v1/ratings/${targetRoom._id.toString()}`)
        .send({ score: 5 });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Unauthorized');
    });
  });

  describe('GET /api/v1/ratings/:roomId', () => {
    it('should return 200 and calculated summary', async () => {
      const secondUser = users[1];
      const thirdUser = users[2];

      await Rating.create([
        { user: testUser._id, room: targetRoom._id, score: 5 },
        { user: secondUser._id, room: targetRoom._id, score: 4 },
        { user: thirdUser._id, room: targetRoom._id, score: 4 },
      ]);

      const res = await request(app).get(`/api/v1/ratings/${targetRoom._id.toString()}`);

      expect(res.status).toBe(200);
      expect(res.body.totalCount).toBe(3);
      expect(res.body.avgScore).toBe(4.3);
      expect(res.body.scoreBreakdown).toEqual({
        '4': 2,
        '5': 1,
      });
    });

    it('should return default schema when zero reviews exist', async () => {
      const res = await request(app).get(`/api/v1/ratings/${validObjectId}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        totalCount: 0,
        avgScore: 0,
        scoreBreakdown: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
      });
    });
  });
});
