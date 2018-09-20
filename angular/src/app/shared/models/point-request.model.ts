export class PointRequest {

  _id: string;
  points: number;
  description: string;
  submittedBy: string;   // full name of user
  submittedById: string; // user's Id
  submittedDate: string;
  approved: number;

  constructor() { }

  setId(_id: string) { this._id = _id; }
  getId() { return this._id; }

  setPoints(points: number) { this.points = points; }
  getPoints() { return this.points }

  setDescription(description: string) { this.description = description; }
  getDescription() { return this.description; }

  setSubmittedBy(submittedBy: string) { this.submittedBy = submittedBy; }
  getSubmittedBy() { return this.submittedBy; }

  setSubmittedById(submittedById: string) { this.submittedById = submittedById; }
  getSubmittedById() { return this.submittedById; }

  setApproved(approved: number) { this.approved = approved; }
  getApproved() { return this.approved; }

}
