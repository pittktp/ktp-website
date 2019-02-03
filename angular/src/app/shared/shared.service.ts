import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/';

@Injectable({
  providedIn: 'root'
})

// A class that is used for components to communicate between each other.
// For example, this is used when a user logs in using the LoginComponent, we want to send a signal to
// the NavComponent with the user's name that we get in the LoginComponent so that NavComponent
// can render that name in the top right. 
export class SharedService {

  constructor() { }

  // Observable string sources
  private emitChangeSource = new Subject<any>();

  // Observable string streams
  changeEmitted$ = this.emitChangeSource.asObservable();

  // Service message commands
  emitChange(change: any) {
    this.emitChangeSource.next(change);
  }

}
