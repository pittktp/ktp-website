import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { SharedService } from '../shared.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private auth: AuthService, private sharedService: SharedService, private router: Router) { }

  // Used in app-routing.module.ts to see if a user can navigate to a certain component.
  // This function will fail if there is no JWT token in LocalStorage or there is, but it's expired 
  canActivate(next: ActivatedRouteSnapshot,state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (!this.auth.isTokenExpired()) {
      return true;
    }

    this.auth.logout();
    alert('You have been logged out - automatically logs you out after 3 hours');
    this.sharedService.emitChange({"name": ''});
    this.router.navigate(['login']);
    return false;
  }
}
