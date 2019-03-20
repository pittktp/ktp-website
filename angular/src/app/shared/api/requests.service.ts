import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from  '@angular/common/http';

import { Request } from '../models/request.model';


@Injectable({
  providedIn: 'root'
})

// Class that does the actual API call to the backend to GET, POST, PUT, and DELETE Request objects
export class RequestsService {

  // Dev - use this url when running locally on your own computer
  API_URL = 'http://localhost:3000/api/requests/';

  // Production - use this url when running in production on AWS
  //API_URL = 'https://pitt-kappathetapi.com/api/requests/';

  requests: Request[];
  numRequestsAvailable = 0;

  constructor(private httpClient: HttpClient) { }

  getRequests() {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set("authorization", token);

    return this.httpClient.get(`${this.API_URL}`, { headers: headers });
  }

  postRequest(request: Request) {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set("authorization", token);

    return this.httpClient.post<Request>(`${this.API_URL}`, request, { headers: headers });
  }

  postImageRequest(request: Request, targetFile: File, newFileName: string) {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set("authorization", token);

    var formData: FormData = new FormData();
    Object.keys(request).forEach(key => formData.append(key, request[key]));
    formData.append('newFileName', newFileName);
    formData.append('image', targetFile);

    return this.httpClient.post<Request>(`${this.API_URL}`, formData, { headers: headers });
  }

  putRequest(id: string, modifiedRequest: Request) {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set("authorization", token);

    return this.httpClient.put<Request>(`${this.API_URL}` + id, modifiedRequest, { headers: headers });
  }

  deleteRequest(id: string) {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set("authorization", token);

    return this.httpClient.delete(`${this.API_URL}` + id, { headers: headers });
  }

}
