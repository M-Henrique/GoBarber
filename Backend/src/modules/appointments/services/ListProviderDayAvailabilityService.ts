import 'reflect-metadata';

import { inject, injectable } from 'tsyringe';
import { getHours, isAfter } from 'date-fns';

import IAppointmentsRepository from '../repositories/IAppointmentsRepository';

import User from '@modules/users/infra/typeorm/entities/User';

interface IRequestDTO {
   provider_id: string;
   day: number;
   month: number;
   year: number;
}

type IResponse = Array<{
   hour: number;
   available: boolean;
}>;

@injectable()
export default class ListProviderDayAvailabilityService {
   constructor(
      @inject('AppointmentsRepository')
      private appointmentsRepository: IAppointmentsRepository
   ) {}

   public async execute({ provider_id, day, month, year }: IRequestDTO): Promise<IResponse> {
      const appointments = await this.appointmentsRepository.findAllInDayFromProvider({
         provider_id,
         day,
         month,
         year,
      });

      const hourStart = 8;

      const eachHourArray = Array.from({ length: 10 }, (_, index) => index + hourStart);

      const currentDate = new Date(Date.now());
      const availability = eachHourArray.map((hour) => {
         const hasAppointmentInHour = appointments.find(
            (appointment) => getHours(appointment.date) + 3 === hour
         );

         const compareDate = new Date(year, month - 1, day, hour);

         return {
            hour,
            available: !hasAppointmentInHour && isAfter(compareDate, currentDate),
         };
      });

      return availability;
   }
}
