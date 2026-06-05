import { Types } from 'mongoose';
import type { HydratedDocument } from 'mongoose';

import type { IReview } from '../../src/models/Review';
import type { IRoom } from '../../src/models/Room';
import type { IUser } from '../../src/models/User';

export const createReviewFixtures = (
  users: HydratedDocument<IUser>[],
  room: HydratedDocument<IRoom>,
): IReview[] => {
  const [userId, otherUserId, anotherUserId] = users.map(({ _id }) => new Types.ObjectId(_id));
  const roomId = new Types.ObjectId(room._id);

  return [
    {
      user: userId,
      room: roomId,
      text: '1',
      likes: [otherUserId, anotherUserId],
    },
    {
      user: otherUserId,
      room: roomId,
      text: '2',
      likes: [anotherUserId],
    },
    {
      user: anotherUserId,
      room: roomId,
      text: '3',
      likes: [userId],
    },
  ];
};
