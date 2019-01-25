import { Component, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { AuthService } from '../shared/auth/auth.service';
import { SharedService } from '../shared/shared.service';
import { DropdownService } from '../shared/dropdown.service';
import { Router } from '@angular/router';

import { Request } from '../shared/models/request.model';
import { ToastrService } from 'ngx-toastr';
import { MemberService } from '../shared/api/member.service';
import { RequestsService } from '../shared/api/requests.service';
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
  public user = '';
  public userRole = '';
  private expanded = false;
  private expectedMembers: Member[];

  constructor(private toastr: ToastrService, private auth: AuthService, private router: Router, public requestsService: RequestsService, public memberService: MemberService, private sharedService: SharedService, private dropdownService: DropdownService) {
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
        this.user = change.name;
        this.userRole = change.role;
      }
    );

  }

  loadScript(src) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    document.getElementsByTagName("body")[0].appendChild(script);
    script.src = src;
  }

  ngOnInit() {
    this.expanded = $(".collapse").is(":visible");
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

  onDropdown() {
    $('.dropdown').toggleClass('open');
  }

  onDropup() {
    if(!this.expanded) {
      $('.dropdown-menu').removeClass('open');
    }
    else {
      $('.dropdown').removeClass('open');
    }
  }

  onLoginClicked() {
    this.router.navigate(['login'])
  }

  onPointsClicked() {
    this.onDropup();
    this.router.navigate(['points'])
  }

  onEditMembersClicked() {
    this.onDropup();
    this.router.navigate(['edit-members']);
  }

  onAttendanceClicked() {
    if(!this.auth.isTokenExpired()) {
      this.getMembers();
      $("#attendanceModal").modal("show");
      this.requestsService.getRequests().subscribe((res) => {
        var requests = res as Request[];
        var membersApprovedAbsence: Member[];
        var mems = this.memberService.members;
        this.expectedMembers = mems;

        for (var i = 0; i < requests.length; i++) {
          if(requests[i].type == "Excused Absence" && requests[i].approved == 1 && this.getCurrentDate() == requests[i].value.toString()) {
            this.memberService.getMemberById(requests[i].submittedById).subscribe((res) => {
              var member = res as Member;
              this.expectedMembers = this.expectedMembers.filter(item => item._id !== member._id);
            });
          }
        }
      });
    }
    else {
      this.auth.logout();
      alert('You have been logged out - automatically logs you out after 3 hours');
      this.user = '';
      this.router.navigate(['login']);
    }
  }

  getCurrentDate() {
    var today = new Date();

    var dd = today.getDate().toString();
    if (dd.length < 2 && dd.charAt(0) != '0')
      dd = '0' + dd;

    var mm = (today.getMonth() + 1).toString();
    if (mm.length < 2 && mm.charAt(0) != '0')
      mm = '0' + mm;

    var yyyy = today.getFullYear();

    var strDate = yyyy + '/' + mm + '/' + dd;
    return strDate.replace(/\//g, '');
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
