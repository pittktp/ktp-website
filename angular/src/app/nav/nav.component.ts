import { Component, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { AuthService } from '../shared/auth/auth.service';
import { SharedService } from '../shared/shared.service';
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
  styleUrls: ['./nav.component.scss']
})

// Component that acts as the navbar. It is always on screen at the top and acts as navigation throughout our site.
export class NavComponent implements OnInit {

  private membersNotHere: Array<object> = [];
  public user = '';
  public userId = '';
  public userRole = '';
  private expanded = false;
  private expectedMembers: Member[];

  // Gets current user's information if logged in
  constructor(private toastr: ToastrService, private auth: AuthService, private router: Router, public requestsService: RequestsService, public memberService: MemberService, private sharedService: SharedService) {
    if(this.auth.loggedIn()) {
      var currentUserId = this.auth.getCurrentUserId();
      this.memberService.getMemberById(currentUserId).subscribe((res) => {
        var member = res as Member;
        this.user = member.name;
        this.userRole = member.role;
        this.userId = member.email.split('@')[0];
      });
    }
    else {

      this.user = '';
      this.userRole = '';
      this.userId = '';
    }

    // Listens for any changes emitted -> for example, when user logs in in LoginComponent then the
    // LoginComponent will emitChange() sending over the user's name, role, and id and this is where
    // NavComponent listens for that change.
    this.sharedService.changeEmitted$.subscribe(
      change => {
        this.user = change.name;
        this.userRole = change.role;
        this.userId = change.id;
      }
    );

  }

  ngOnInit() {
    //this.expanded = $(".collapse").is(":visible");
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

  // Drops down the navbar dropdown (the dropdown when a user clicks his/her name in the navbar)
  onDropdown() {
    $('.dropdown').toggleClass('open');
  }

  // Opens the dropdown if it's currently closed, and closes it if it's currently open
  onDropup() {
    if(!this.expanded) {
      $('.dropdown-menu').removeClass('open');
    }
    else {
      $('.dropdown').removeClass('open');
    }
  }

  // Tells router to navigate/show the HomeComponent
  onHomeClicked() {
    this.router.navigate(['home']);
  }

  // Closes dropdown if it's open, and tells the router to navigate/show the MembersComponent
  onMembersClicked() {
    this.onDropup();
    this.router.navigate(['members']);
  }

  // Closes dropdown if it's open, and tells the router to navigate/show the ProfileComponent
  onProfileClicked() {
    this.onDropup();
    this.router.navigate(['profile', this.userId]);
  }

  // Tells the router to navigate/show the LoginComponent
  onLoginClicked() {
    this.router.navigate(['login']);
  }

  // Closes dropdown if it's open, and tells the router to navigate/show the PointsComponent
  onPointsClicked() {
    this.onDropup();
    this.router.navigate(['points'])
  }

  // Closes dropdown if it's open, and tells the router to navigate/show the EditMembersComponent
  onEditMembersClicked() {
    this.onDropup();
    this.router.navigate(['edit-members']);
  }

  // Shows the take attendance modal if the user is logged in.
  // Shows all members that did NOT submit an excused absence for the current day.
  // Allows an admin to mark who isn't here and it adds that member to an Array of membersNotHere.
  // Upon submitting of the modal, the Array of membersNotHere is iterated through and marked as an unexcused absence.
  onAttendanceClicked() {
    this.onDropup();
    if(!this.auth.isTokenExpired()) {
      this.getMembers();
      $("#attendanceModal").modal("show");

      // Gets up-to-date list of requests from the DB
      this.requestsService.getRequests().subscribe((res) => {
        var requests = res as Request[];
        var membersApprovedAbsence: Member[];  // array of members that did submit an excused absence for the current day
        var mems = this.memberService.members;
        this.expectedMembers = mems;  // array of members who are expected to be present -> use this array to render the members in the modal

        // Iterate thru array of requests -> if the current request is of type "Excused Absence" AND the request is approved, AND
        // The request's value (the date expected to miss) is equal to the current date, then this member is all good to miss today.
        for (var i = 0; i < requests.length; i++) {
          if(requests[i].type == "Excused Absence" && requests[i].approved == 1 && this.getCurrentDate() == requests[i].value.toString()) {
            this.memberService.getMemberById(requests[i].submittedById).subscribe((res) => {
              var member = res as Member;
              this.expectedMembers = this.expectedMembers.filter(item => item._id !== member._id); // remove this member from the list of expected members
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

  // Gets the current date and formats it to the the form of, for example, 20190102
  // which represents January 2nd, 2019.
  // Need it in this format so we can easily compare it to how an "Excused Absence" request's
  // date is stored in the DB.
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

  // Called when done taking attendance. Iterates thru the global variable membersNotHere
  // and increments each members unexcusedAbsence by 1, and then saves them back to the DB
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

  // Called when the attendance modal is closed -> clears the membersNotHere array
  onAttendanceClosed() {
    this.membersNotHere = [];
    this.toastr.error('Take attendance canceled');
    $("#attendanceModal").modal("hide");
  }

  // Adds the member to the array membersNotHere when taking attendance
  onNotHere(member: Member) {
    this.membersNotHere.push(member);
  }

  // Logs the user out which clears the JWT token from LocalStorage (this.auth.logout())
  onLogout() {
    if(confirm("Confirm logout?")) {
      this.auth.logout();
      this.user = '';
      this.userId = '';
      this.router.navigate(['home']);
      this.toastr.success('Successfully logged out');
    }
  }

}
