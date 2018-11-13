import { Injectable } from '@angular/core';
import { HttpClient} from  '@angular/common/http';

import { Member } from '../models/member.model';
import { stringify } from '@angular/compiler/src/util';

@Injectable({
  providedIn: 'root'
})
export class MemberService {

  API_URL = 'http://localhost:3000/api/members';

  members: Member[];
  user = '';
  userId = '';
  userRole = 'member';

  constructor(private httpClient: HttpClient) { }

  getMembers() {
    return this.httpClient.get(`${this.API_URL}`);
  }

  postMember(member: Member) {
    return this.httpClient.post<Member>(`${this.API_URL}`, member);
  }

  getMemberById(id: string) {
    return this.httpClient.get(`${this.API_URL}/${id}`);
  }

  putMember(id: string, member: Member) {
    return this.httpClient.put<Member>(`${this.API_URL}/${id}`, member);
  }

  deleteMember(id: string) {
    return this.httpClient.delete(`${this.API_URL}/${id}`);
  }

  postFile(id: string, targetFile: File) {
    var formData: FormData = new FormData();
    formData.append('image', targetFile, targetFile.name);
    
    return this.httpClient.post(`${this.API_URL}/${id}/image`, formData);
  }

  putDescription(id: string, desc: string) {
    return this.httpClient.put(`${this.API_URL}/${id}/desc`, desc);
  }

  putMajor(id: string, major: string) {
    return this.httpClient.put(`${this.API_URL}/${id}/major`, major);
  }

  putGradSemester(id: string, gradSemester: string) {
    return this.httpClient.put(`${this.API_URL}/${id}/gradSemester`, gradSemester);
  }

  putCourse(id: string, course: string) {
    return this.httpClient.put(`${this.API_URL}/${id}/course`, course);
  }

  deleteCourse(id: string, course: string) {
    return this.httpClient.put(`${this.API_URL}/${id}/course`, course);
  }

}
