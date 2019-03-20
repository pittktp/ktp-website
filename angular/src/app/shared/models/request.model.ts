// Class to represent a Request object

export class Request {

  _id: string;
  value: number;
  description: string;
  picture: string;
  type: string;
  submittedBy: string;   // full name of user
  submittedById: string; // user's Id
  submittedDate: string;
  approved: number;

  constructor() { }

}
