import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as jwt_decode from "jwt-decode";

import { MemberService } from '../api/member.service';
import { Member } from '../models/member.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // URL of dev backend server
  //API_URL = 'http://localhost:3000/api/auth';

  // URL of production backend server
  API_URL = 'https://pitt-kappathetapi.com/api/auth/';

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<boolean> {
    return this.http.post<{token: string}>(this.API_URL, {email: email, password: password})
      .pipe(
        map(result => {
          localStorage.setItem('access_token', result.token);
          return true;
        })
      );
  }

  logout() {
    localStorage.removeItem('access_token');
  }

  getToken() {
    return localStorage.getItem('access_token');
  }

  getTokenExpirationDate(token: string): Date {
    const decoded = jwt_decode(token);

    if (decoded.exp === undefined) return null;

    const date = new Date(0);
    date.setUTCSeconds(decoded.exp);
    return date;
  }

  isTokenExpired(): boolean {
    var token = this.getToken();

    if(!token) return true;

    const date = this.getTokenExpirationDate(token);
    if(date === undefined) return false;
    return !(date.valueOf() > new Date().valueOf());
  }

  loggedIn(): boolean {
    return (localStorage.getItem('access_token') !== null && !this.isTokenExpired());
  }

  getCurrentUserId() {
    if(this.loggedIn()) {
      return jwt_decode(localStorage.getItem('access_token')).userID;
    }
  }

}
