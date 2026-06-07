import type { HydratedDocument } from 'mongoose';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import app from '../src/app.js';
import type { IUser } from '../src/models/User.js';
import User from '../src/models/User.js';

import { invalidObjectId, validObjectId } from './fixtures/shared.js';
import { validUserData } from './fixtures/user.fixture.js';
import { getAuthHeader } from './utils/auth.js';

describe('Users API (Integration)', () => {
  let testUser: HydratedDocument<IUser>;
  let authHeader: any;

  beforeEach(async () => {
    testUser = await User.create(validUserData);
    authHeader = getAuthHeader(testUser._id, testUser.role);
  });

  describe('GET /api/v1/users/me', () => {
    it('should return 200 and current user profile when authorized', async () => {
      const res = await request(app).get('/api/v1/users/me').set(authHeader);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(testUser._id.toString());
      expect(res.body.email).toBe(testUser.email);
      expect(res.body.password).toBeUndefined();
    });

    it('should return 401 when authorization token is missing', async () => {
      const res = await request(app).get('/api/v1/users/me');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('should return 200 and user data when id is valid', async () => {
      const res = await request(app).get(`/api/v1/users/${testUser._id.toString()}`);

      expect(res.status).toBe(200);
      expect(res.body.firstName).toBe(testUser.firstName);
      expect(res.body.lastName).toBe(testUser.lastName);
      expect(res.body.password).toBeUndefined();
    });

    it('should return 400 when user ID is not valid', async () => {
      const res = await request(app).get(`/api/v1/users/${invalidObjectId}`);

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
      expect(res.body.errors[0].field).toBe('id');
    });

    it('should return 404 when user ID is valid but user not exist', async () => {
      const res = await request(app).get(`/api/v1/users/${validObjectId}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('User not found');
    });
  });
});
