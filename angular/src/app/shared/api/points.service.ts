import { Injectable } from '@angular/core';
import { HttpClient} from  '@angular/common/http';

import { PointRequest } from '../models/point-request.model';


@Injectable({
  providedIn: 'root'
})
export class PointsService {

  API_URL = 'http://localhost:3000/api/points/';

  constructor(private httpClient: HttpClient) { }

  getPointRequests() {
    return this.httpClient.get(`${this.API_URL}`);
  }

  postPointRequest(request: PointRequest) {
    return this.httpClient.post<PointRequest>(`${this.API_URL}`, request);
  }

  putPointRequest(id: string, modifiedRequest: PointRequest) {
    return this.httpClient.put<PointRequest>(`${this.API_URL}` + id, modifiedRequest);
  }

  deletePointRequest(id: string) {
    return this.httpClient.delete(`${this.API_URL}` + id);
  }

}
