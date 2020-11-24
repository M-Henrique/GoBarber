import AppError from '@shared/errors/AppError';

import UpdateUserAvatarService from './UpdateUserAvatarService';

import FakeUsersRepository from '../repositories/fakes/FakeUsersRepository';

import FakeStorageProvider from '@shared/container/providers/StorageProvider/fakes/FakeStorageProvider';

let fakeUsersRepository: FakeUsersRepository;
let fakeStorageProvider: FakeStorageProvider;
let updateUserAvatar: UpdateUserAvatarService;

describe('UpdateUserAvatar', () => {
   beforeEach(() => {
      fakeUsersRepository = new FakeUsersRepository();
      fakeStorageProvider = new FakeStorageProvider();

      updateUserAvatar = new UpdateUserAvatarService(fakeUsersRepository, fakeStorageProvider);
   });

   it('should be able to update an user´s avatar', async () => {
      const user = await fakeUsersRepository.create({
         name: 'John Doe',
         email: 'johndoe@example.com',
         password: '123456',
      });

      await updateUserAvatar.execute({
         user_id: user.id,
         avatarFileName: 'avatar.jpg',
      });

      expect(user.avatar).toBe('avatar.jpg');
   });

   it('should not be able to update a non existing user´s avatar', async () => {
      await expect(
         updateUserAvatar.execute({
            user_id: 'non existing user',
            avatarFileName: 'avatar.jpg',
         })
      ).rejects.toBeInstanceOf(AppError);
   });

   it('should delete old avatar when updating', async () => {
      const deleteFile = jest.spyOn(fakeStorageProvider, 'deleteFile');

      const user = await fakeUsersRepository.create({
         name: 'John Doe',
         email: 'johndoe@example.com',
         password: '123456',
      });

      await updateUserAvatar.execute({
         user_id: user.id,
         avatarFileName: 'avatar.jpg',
      });

      await updateUserAvatar.execute({
         user_id: user.id,
         avatarFileName: 'avatar2.jpg',
      });

      expect(deleteFile).toHaveBeenCalledWith('avatar.jpg');

      expect(user.avatar).toBe('avatar2.jpg');
   });
});
