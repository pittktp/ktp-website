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

// Class that does the actual API call to talk to the backend to see if the user is valid or not (the login function).
// Other functions are used in the frontend to verify if the user is still logged in and stuff like that.
export class AuthService {

  // Dev - use this url when running locally on your own computer
  API_URL = 'http://localhost:3000/api/auth';

  // // Production - use this url when running in production on AWS
  //API_URL = 'https://pittkappathetapi.com/api/auth/';

  constructor(private http: HttpClient) { }

  // Called when a user attempts a login.
  // If backend says its a valid email/password combo, it sends back a JWT token that says "hey frontend you can talk to me"
  // This token is stored in the browser's LocalStorage -> whenever we want to see if a user's logged in, we check for this token
  login(email: string, password: string): Observable<boolean> {
    return this.http.post<{token: string}>(this.API_URL, {email: email, password: password})
      .pipe(
        map(result => {
          localStorage.setItem('access_token', result.token);
          return true;
        })
      );
  }

  // Removes the JWT token from LocalStorage
  logout() {
    localStorage.removeItem('access_token');
  }

  // Returns the JWT token if its available
  getToken() {
    return localStorage.getItem('access_token');
  }

  // Checks to see when the JWT token in LocalStorage expires
  getTokenExpirationDate(token: string): Date {
    const decoded = jwt_decode(token);

    if (decoded.exp === undefined) return null;

    const date = new Date(0);
    date.setUTCSeconds(decoded.exp);
    return date;
  }

  // Checks to see if the JWT token in LocalStorage is expired or not
  isTokenExpired(): boolean {
    var token = this.getToken();

    if(!token) return true;

    const date = this.getTokenExpirationDate(token);
    if(date === undefined) return false;
    return !(date.valueOf() > new Date().valueOf());
  }

  // Checks to see if user is logged in -> there has to be a JWT token in LocalStorage AND the token can't be expired
  loggedIn(): boolean {
    return (localStorage.getItem('access_token') !== null && !this.isTokenExpired());
  }

  // The currently logged in user's database ID is encoded into the JWT token.
  // This function returns the current user's ID.
  getCurrentUserId() {
    if(this.loggedIn()) {
      return jwt_decode(localStorage.getItem('access_token')).userID;
    }
  }

}
