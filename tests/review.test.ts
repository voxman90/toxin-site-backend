import type { HydratedDocument } from 'mongoose';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import app from '../src/app.js';
import Review from '../src/models/Review.js';
import Room from '../src/models/Room.js';
import type { IUser } from '../src/models/User.js';
import User from '../src/models/User.js';

import { createReviewFixtures } from './fixtures/review.fixture.js';
import { roomFixtures } from './fixtures/room.fixture.js';
import { validObjectId } from './fixtures/shared.js';
import { userFixtures } from './fixtures/user.fixture.js';
import { getAuthHeader } from './utils/auth.js';

describe('Reviews API (Integration)', () => {
  let testUser: any;
  let users: HydratedDocument<IUser>[];
  let targetRoom: any;
  let authHeader: any;

  beforeEach(async () => {
    await Room.create(roomFixtures);

    targetRoom = await Room.findOne({ roomNumber: 101 });

    users = await User.create(userFixtures);
    testUser = await User.findOne({ email: userFixtures[0].email });
    authHeader = getAuthHeader(testUser._id, testUser.role);
  });

  describe('POST /api/v1/reviews/:roomId', () => {
    it('should successfully post a review when user is authorized', async () => {
      const res = await request(app).post('/api/v1/reviews/').set(authHeader).send({
        text: 'Mock review',
        roomId: targetRoom._id.toString(),
      });

      expect(res.status).toBe(201);

      const review = await Review.findOne({ text: 'Mock review' });
      expect(review).toBeTruthy();
    });

    it('should return 400 when required fields are missing', async () => {
      const res = await request(app).post('/api/v1/reviews/').set(authHeader).send({
        roomId: targetRoom._id.toString(),
      });

      expect(res.status).toBe(400);
    });

    it('should return 401 when user is not authenticated', async () => {
      const res = await request(app).post('/api/v1/reviews/').send({
        text: 'Mock review',
        roomId: targetRoom._id.toString(),
      });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/reviews/:roomId', () => {
    beforeEach(async () => {
      const reviewFixtures = createReviewFixtures(users, targetRoom);
      await Review.create(reviewFixtures);
    });

    it('should return 200 and paginated reviews with correct counters', async () => {
      const firstPage = await request(app)
        .get(`/api/v1/reviews/${targetRoom._id.toString()}`)
        .query({
          page: 1,
          limit: 2,
        });

      expect(firstPage.status).toBe(200);
      expect(firstPage.body.docs.length).toBe(2);
      expect(firstPage.body.totalDocs).toBe(3);
      expect(firstPage.body.page).toBe(1);

      const secondPage = await request(app)
        .get(`/api/v1/reviews/${targetRoom._id.toString()}`)
        .query({
          page: 2,
          limit: 2,
        });

      expect(secondPage.status).toBe(200);
      expect(secondPage.body.docs.length).toBe(1);
      expect(secondPage.body.totalDocs).toBe(3);
      expect(secondPage.body.page).toBe(2);
    });

    it('should return 400 when query parameters (page, limit) are invalid', async () => {
      const res = await request(app).get(`/api/v1/reviews/${targetRoom._id.toString()}`).query({
        page: -1,
        limit: 1,
      });

      expect(res.status).toBe(400);
      expect(res.body.errors[0].field).toBe('page');
      expect(res.body.errors[0].message).toBe('Page must be a positive number');

      const otherRes = await request(app)
        .get(`/api/v1/reviews/${targetRoom._id.toString()}`)
        .query({
          page: 1,
          limit: 'Wololo!',
        });

      expect(otherRes.status).toBe(400);
      expect(otherRes.body.errors[0].field).toBe('limit');
      expect(otherRes.body.errors[0].message).toBe('Limit must be a positive number');
    });

    it('should return "isLiked"=true for liked posts for an authenticated user', async () => {
      const res = await request(app)
        .get(`/api/v1/reviews/${targetRoom._id.toString()}`)
        .set(authHeader)
        .query({ page: 1, limit: 3, sort: 'text' });

      expect(res.body.docs[0].isLiked).toBe(false);
      expect(res.body.docs[1].isLiked).toBe(false);
      expect(res.body.docs[2].isLiked).toBe(true);

      const otherAuthHeader = getAuthHeader(users[1]._id, users[1].role);

      const otherRes = await request(app)
        .get(`/api/v1/reviews/${targetRoom._id.toString()}`)
        .set(otherAuthHeader)
        .query({ page: 1, limit: 3, sort: 'text' });

      expect(otherRes.body.docs[0].isLiked).toBe(true);
      expect(otherRes.body.docs[1].isLiked).toBe(false);
      expect(otherRes.body.docs[2].isLiked).toBe(false);
    });
  });

  describe('POST /api/v1/reviews/:reviewId/toggle-like', () => {
    beforeEach(async () => {
      const reviewFixtures = createReviewFixtures(users, targetRoom);
      await Review.create(reviewFixtures);
    });

    it('should toggle like successfully when user is authorized', async () => {
      const targetReview = await Review.findOne({ text: '2' });

      const res = await request(app)
        .put(`/api/v1/reviews/${targetReview?._id.toString()}/toggle-like`)
        .set(authHeader);

      expect(res.status).toBe(200);
      expect(res.body.isLiked).toBe(true);
      expect(res.body.likeCount).toBe(2);

      const otherRes = await request(app)
        .put(`/api/v1/reviews/${targetReview?._id.toString()}/toggle-like`)
        .set(authHeader);

      expect(otherRes.status).toBe(200);
      expect(otherRes.body.isLiked).toBe(false);
      expect(otherRes.body.likeCount).toBe(1);

      const reviewAfterDislike = await Review.findById(targetReview?._id);
      expect(reviewAfterDislike?.likes.length).toBe(1);
      expect(reviewAfterDislike?.likes.includes(testUser._id)).toBe(false);
    });

    it('should not toggle like when review written by the same user', async () => {
      const targetReview = await Review.findOne({ text: '1' });

      const res = await request(app)
        .put(`/api/v1/reviews/${targetReview?._id.toString()}/toggle-like`)
        .set(authHeader);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('You cannot like your own review');

      const reviewAfterTry = await Review.findById(targetReview?._id);
      expect(reviewAfterTry?.likes.includes(testUser._id)).toBe(false);
    });

    it('should return 404 when review not found', async () => {
      const res = await request(app)
        .put(`/api/v1/reviews/${validObjectId}/toggle-like`)
        .set(authHeader);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Review not found');
    });

    it('should return 401 when user is not authenticated', async () => {
      const targetReview = await Review.findOne({ text: '1' });

      const res = await request(app).put(
        `/api/v1/reviews/${targetReview?._id.toString()}/toggle-like`,
      );

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Unauthorized');

      const reviewAfterTry = await Review.findById(targetReview?._id);
      expect(reviewAfterTry?.likes.length).toBe(2);
    });
  });
});
