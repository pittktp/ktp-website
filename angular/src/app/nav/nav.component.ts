import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../auth.service';
import { SharedService } from '../shared.service';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import { MemberService } from '../shared/api/member.service';
import { Member } from '../shared/models/member.model';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  user = '';
  userId = '';
  userPriviledge = '';

  constructor(private toastr: ToastrService, private auth: AuthService, private router: Router, private memberService: MemberService, private sharedService: SharedService) {
    if(this.auth.loggedIn()) {
      var currentUserId = this.auth.getCurrentUserId();
      this.memberService.getMemberById(currentUserId).subscribe((res) => {
        var member = res as Member;
        this.user = member.name;
        this.userPriviledge = member.role;
      });
    }

    this.sharedService.changeEmitted$.subscribe(
      change => {
        console.log(change.name + ' ' + change.role);
        this.user = change.name;
        this.userPriviledge = change.role;
      }
    );
  }

  ngOnInit() {
  }

  onLoginClicked() {
    this.router.navigate(['login'])
  }

  onPointsClicked() {
    this.router.navigate(['points'])
  }

  onEditMembersClicked() {
    this.router.navigate(['edit-members']);
  }

  onHomeClicked() {
    this.router.navigate(['home'])
  }

  onLogout() {
    if(confirm("Confirm logout?")) {
      this.auth.logout();
      this.user = '';
      this.router.navigate(['home']);
      this.toastr.success('Successfully logged out');
    }
  }

}
