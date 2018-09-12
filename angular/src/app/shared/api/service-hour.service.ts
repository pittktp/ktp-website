import { Injectable } from '@angular/core';
import { HttpClient} from  '@angular/common/http';

import { ServiceHourRequest } from '../models/service-hour-request.model';


@Injectable({
  providedIn: 'root'
})
export class ServiceHourService {

  API_URL = 'http://localhost:3000/api/hours/';
  serviceHours: ServiceHourRequest[];

  constructor(private httpClient: HttpClient) { }

  getServiceHourRequests() {
    return this.httpClient.get(`${this.API_URL}`);
  }

  postServiceHourRequest(request: ServiceHourRequest) {
    return this.httpClient.post<ServiceHourRequest>(`${this.API_URL}`, request);
  }

  putServiceHourRequest(id: string, modifiedRequest: ServiceHourRequest) {
    return this.httpClient.put<ServiceHourRequest>(`${this.API_URL}` + id, modifiedRequest);
  }

  deleteServiceHourRequest(id: string) {
    return this.httpClient.delete(`${this.API_URL}` + id);
  }

}
