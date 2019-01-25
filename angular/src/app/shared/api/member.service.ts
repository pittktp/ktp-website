import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from  '@angular/common/http';

import { Member } from '../models/member.model';

@Injectable({
  providedIn: 'root'
})
export class MemberService {

  // Test - use this url when running locally on your own computer
  API_URL = 'http://localhost:3000/api/members/';

  // Production - use this url when running in production on AWS
  //API_URL = 'https://pitt-kappathetapi.com/api/members/';

  members: Member[];
  user = '';
  userId = '';
  userRole = 'member';

  constructor(private httpClient: HttpClient) { }

  getMembers() {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set("authorization", token);

    return this.httpClient.get(`${this.API_URL}`, { headers: headers });
  }

  postMember(member: Member) {
    return this.httpClient.post<Member>(`${this.API_URL}`, member);
  }

  getMemberById(id: string) {
    return this.httpClient.get(`${this.API_URL}` + id);
  }

  updateMemberPassword(email: string, password: string, code: string) {
    return this.httpClient.put(`${this.API_URL}` + "password", { email: email, password: password, code: code});
  }

  putMember(id: string, member: Member) {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set("authorization", token);

    return this.httpClient.put<Member>(`${this.API_URL}` + id, member, { headers: headers });
  }

  deleteMember(id: string) {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set("authorization", token);

    return this.httpClient.delete(`${this.API_URL}` + id, { headers: headers });
  }

}
