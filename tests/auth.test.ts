import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import app from '../src/app.js';
import type { IUser } from '../src/models/User.js';
import User from '../src/models/User.js';
import { validUserData } from './fixtures/user.fixture.js';

const createUserDataMock = (overrides: Partial<IUser> = {}) => ({
  ...validUserData,
  ...overrides
});

describe('Auth API (Integration)', () => {
  describe('POST /register', () => {
    it('should register a new user with valid data', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(validUserData);

      expect(res.status).toBe(201);

      const user = await User.findOne({ email: validUserData.email });
      expect(user).toBeTruthy();
      expect(user?.firstName).toBe(validUserData.firstName);
    });

    it('should ignore role', async () => {
      const userData = createUserDataMock({ role: 'admin' });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      expect(res.status).toBe(201);

      const user = await User.findOne({ email: userData.email });
      expect(user?.role).toBe('user');
    });


    it('should return 400 when registration data is invalid', async () => {
      const invalidUserData = createUserDataMock({ email: 'invalid-email' });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(invalidUserData);

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
      expect(res.body.errors[0].field).toBe('email');
    });

    it('should return 409 if user email already exists', async () => {
      const userWithSameEmail = createUserDataMock({ email: validUserData.email });

      await request(app)
        .post('/api/v1/auth/register')
        .send(validUserData);

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(userWithSameEmail);

      expect(res.status).toBe(409);
    });
  });

  describe('POST /login', () => {
    beforeEach(async () => {
      await User.create(validUserData);
    });

    it('should log in successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: validUserData.email,
          password: validUserData.password,
        });

      expect(res.status).toBe(200);
    });

    it('should return 400 when login payload is malformed', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          invalidField: 'some-text',
          password: 'wrong-password',
        });

      expect(res.status).toBe(400);
    });

    it('should return 401 on incorrect email or password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: validUserData.email,
          password: 'wrong-password',
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
    });
  });
});
