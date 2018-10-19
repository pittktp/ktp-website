import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../shared/auth/auth.service';
import { SharedService } from '../shared/shared.service';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import { MemberService } from '../shared/api/member.service';
import { Member } from '../shared/models/member.model';
import { AuthGuard } from '../shared/auth/auth.guard';


declare var $: any;

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  private membersNotHere: Array<object> = [];
  private user = '';
  private userRole = '';

  constructor(private toastr: ToastrService, private auth: AuthService, private router: Router, private memberService: MemberService, private sharedService: SharedService) {
    if(this.auth.loggedIn()) {
      var currentUserId = this.auth.getCurrentUserId();
      this.memberService.getMemberById(currentUserId).subscribe((res) => {
        var member = res as Member;
        this.user = member.name;
        this.userRole = member.role;
      });
    }
    else {
      this.user = '';
      this.userRole = '';
    }

    this.sharedService.changeEmitted$.subscribe(
      change => {
        console.log(change.name + ' ' + change.role);
        this.user = change.name;
        this.userRole = change.role;
      }
    );
  }

  ngOnInit() {
  }

  // Gets and sorts members based on first name
  getMembers() {
    this.memberService.getMembers().subscribe((data: Array<object>) => {
      var mems = data as Member[]
      mems.sort(function(a, b) {
        var textA = a.name.toUpperCase();
        var textB = b.name.toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
      });
      this.memberService.members = mems;
    });
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

  onAttendanceClicked() {
    if(!this.auth.isTokenExpired()) {
      this.getMembers();
      $("#attendanceModal").modal("show");
    }
    else {
      this.auth.logout();
      alert('You have been logged out - automatically logs you out after 3 hours');
      this.user = '';
      this.router.navigate(['login']);
    }
  }

  onAttendanceSubmit() {
    if(confirm("Finish taking attendance?")) {
      for(var i = 0; i < this.membersNotHere.length; i++) {
        var currentMember = this.membersNotHere[i] as Member;
        var abs = currentMember.absences;
        abs = abs + 1;
        currentMember.absences = abs;
        this.memberService.putMember(currentMember._id, currentMember).subscribe((res) => {
          this.toastr.error(res.name + ' unexcused absence');
        });
      }
      this.membersNotHere = [];
      $("#attendanceModal").modal("hide");
    }
  }

  onAttendanceClosed() {
    this.membersNotHere = [];
    this.toastr.error('Take attendance canceled');
    $("#attendanceModal").modal("hide");
  }

  onNotHere(member: Member) {
    this.membersNotHere.push(member);
  }

  onHomeClicked() {
    this.router.navigate(['home']);
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
