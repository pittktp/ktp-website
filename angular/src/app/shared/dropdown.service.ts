import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/';

@Injectable({
  providedIn: 'root'
})
export class DropdownService {

  constructor() { }

  // Observable string sources
  private emitChangeSource = new Subject<any>();

  // Observable string streams
  changeEmitted$ = this.emitChangeSource.asObservable();

  // Service message commands
  emitChange(drop: any) {
    this.emitChangeSource.next(drop);
  }

}
