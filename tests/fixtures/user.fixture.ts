import type { IUser } from '../../src/models/User';

export const userFixtures: IUser[] = [
  {
    firstName: 'Max',
    lastName: 'Doe',
    gender: 'male',
    birthdate: '2000-01-01',
    email: 'user1@test.com',
    password: 'qwerty12345',
    role: 'user',
    avatarUrl: 'user1.jpg',
    specialOffer: true,
  },
  {
    firstName: 'John',
    lastName: 'Doe',
    gender: 'male',
    birthdate: '1990-01-01',
    email: 'user2@mail.com',
    password: 'JohnDoe',
    role: 'user',
    avatarUrl: 'user2.jpg',
    specialOffer: false,
  },
  {
    firstName: 'Mr',
    lastName: 'Admin',
    gender: 'male',
    birthdate: '2007-05-01',
    email: 'user3@mail.com',
    password: 'admin',
    role: 'user',
    avatarUrl: 'user3.png',
    specialOffer: false,
  },
];

export const validUserData = userFixtures[0];
