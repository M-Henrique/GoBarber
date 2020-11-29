import AppError from '@shared/errors/AppError';

import FakeCacheProvider from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider';

import FakeNotificationsRepository from '@modules/notifications/repositories/fakes/FakeNotificationsRepository';
import FakeAppointmentsRepository from '../repositories/fakes/FakeAppointmentsRepository';
import CreateAppointmentService from './CreateAppointmentService';

let fakeCacheProvider: FakeCacheProvider;
let fakeAppointmentsRepository: FakeAppointmentsRepository;
let fakeNotificationsRepository: FakeNotificationsRepository;
let createAppointment: CreateAppointmentService;

describe('CreateAppointment', () => {
   beforeEach(() => {
      fakeCacheProvider = new FakeCacheProvider();
      fakeAppointmentsRepository = new FakeAppointmentsRepository();
      fakeNotificationsRepository = new FakeNotificationsRepository();

      createAppointment = new CreateAppointmentService(
         fakeAppointmentsRepository,
         fakeNotificationsRepository,
         fakeCacheProvider
      );
   });

   it('should be able to create a new appointment', async () => {
      jest.spyOn(Date, 'now').mockImplementationOnce(() => {
         return new Date(2020, 4, 10, 12).getTime();
      });

      const appointment = await createAppointment.execute({
         date: new Date(2020, 4, 10, 13),
         user_id: 'userid',
         provider_id: 'provid',
      });

      expect(appointment).toHaveProperty('id');
      expect(appointment.provider_id).toBe('provid');
   });

   it('should not be able to create two appointments at the same time', async () => {
      jest.spyOn(Date, 'now').mockImplementationOnce(() => {
         return 0;
      });

      const appointmentDate = new Date(2020, 4, 10, 11);

      await createAppointment.execute({
         date: appointmentDate,
         user_id: 'userid',
         provider_id: 'provid',
      });

      await expect(
         createAppointment.execute({
            date: appointmentDate,
            user_id: 'userid',
            provider_id: 'provid',
         })
      ).rejects.toBeInstanceOf(AppError);
   });

   it('should not be able to create an appointment at a past date', async () => {
      jest.spyOn(Date, 'now').mockImplementationOnce(() => {
         return new Date(2020, 4, 10, 12).getTime();
      });

      await expect(
         createAppointment.execute({
            date: new Date(2020, 4, 10, 11),
            user_id: 'userid',
            provider_id: 'provid',
         })
      ).rejects.toBeInstanceOf(AppError);
   });

   it('should not be able to create an appointment with same user as provider', async () => {
      jest.spyOn(Date, 'now').mockImplementationOnce(() => {
         return new Date(2020, 4, 10, 12).getTime();
      });

      await expect(
         createAppointment.execute({
            date: new Date(2020, 4, 10, 13),
            user_id: 'userid',
            provider_id: 'userid',
         })
      ).rejects.toBeInstanceOf(AppError);
   });

   it('should not be able to create an appointment outside the range of available schedules', async () => {
      jest.spyOn(Date, 'now').mockImplementationOnce(() => {
         return new Date(2020, 4, 10, 12).getTime();
      });

      await expect(
         createAppointment.execute({
            date: new Date(2020, 4, 11, 7),
            user_id: 'userid',
            provider_id: 'provid',
         })
      ).rejects.toBeInstanceOf(AppError);

      await expect(
         createAppointment.execute({
            date: new Date(2020, 4, 11, 18),
            user_id: 'userid',
            provider_id: 'provid',
         })
      ).rejects.toBeInstanceOf(AppError);
   });
});
