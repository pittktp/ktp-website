export class ServiceHourRequest {

  _id: string;
  serviceHours: number;
  description: string;
  submittedBy: string;   // full name of user
  submittedById: string; // user's Id
  approved: number;

  constructor() { }

}
