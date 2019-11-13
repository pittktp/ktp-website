import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from  '@angular/common/http';

import { RushMember } from '../models/rushMember.model';
import { stringify } from '@angular/compiler/src/util';

import * as aws4 from 'aws4';

@Injectable({
  providedIn: 'root'
})

export class RushService {

  // Dev - use this url when running locally on your own computer
  API_URL = 'http://localhost:3000/api/rush/';

  // Production - use this url when running in production on AWS
  //API_URL = 'https://pittkappathetapi.com/api/rush/';


  rushMembers: RushMember[];

  constructor(private httpClient: HttpClient) { }

  getRushMembers() {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set("authorization", token);

    return this.httpClient.get(`${this.API_URL}`, { headers: headers });
  }

  postRushMember(member: RushMember) {
    return this.httpClient.post<Member>(`${this.API_URL}`, member);
  }


  deleteRushMember(id: string) {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set("authorization", token);

    return this.httpClient.delete(`${this.API_URL}` + id, { headers: headers });
  }

}
