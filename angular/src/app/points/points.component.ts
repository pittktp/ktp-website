import { Component, OnInit, Input, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { MemberService } from '../shared/api/member.service';
import { RequestsService } from '../shared/api/requests.service';
import { LoginComponent } from '../login/login.component';
import { Member } from '../shared/models/member.model';
import { Request } from '../shared/models/request.model';
import { AuthService } from '../shared/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { BsDatepickerModule } from 'ngx-bootstrap';

declare var $: any;

@Component({
  selector: 'app-points',
  templateUrl: './points.component.html',
  styleUrls: ['./points.component.scss']
})

// Component only accessible when logged in. Shows a list of all members and their information.
// Also gives functionality to submitting brotherhood points, service hours, an excused absence,
// and allows admins to accept/deny them.
export class PointsComponent implements OnInit {

  userId: string;
  user: string;
  userRole: string;
  requestForm: Request = new Request();
  membersRequests: Array<object> = [];
  currentHistoryMember: string;

  // Gets user's info if logged in
  constructor(private toastr: ToastrService, private auth: AuthService, public memberService: MemberService, public requestsService: RequestsService, private router: Router) {
    if(this.auth.loggedIn()) {
      var currentUserId = this.auth.getCurrentUserId();
      this.userId = currentUserId;
      this.memberService.getMemberById(currentUserId).subscribe((res) => {
        var member = res as Member;
        this.user = member.name;
        this.userRole = member.role;
        if(member.role == 'admin') { this.getRequests(); }
      });
    }
  }

  // Gets user's info if logged in
  ngOnInit() {
    if(this.auth.loggedIn()) {
      var currentUserId = this.auth.getCurrentUserId();
      this.userId = currentUserId;
      this.memberService.getMemberById(currentUserId).subscribe((res) => {
        var member = res as Member;
        this.user = member.name;
        this.userRole = member.role;
        if(member.role == 'admin') { this.getRequests(); }
      });
    }
    this.loadScript('../assets/js/new-age.js');
    this.getMembers();
    if(this.userRole == 'admin') {
      this.getRequests();
    }
  }

  // A hacked up way to load the js script needed for this component
  loadScript(src) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    document.getElementsByTagName("body")[0].appendChild(script);
    script.src = src;
  }

  // Refreshes members -> simply calls this components getMembers() (why'd I even do this lolol)
  refreshMembers() {
    this.getMembers();
  }

  // Refreshes requests -> simply calls this components getRequests() (why'd I even do this lolol)
  refreshRequests() {
    this.getRequests();
  }

  // Gets all members from the database and updates memberService.members to equal the response
  getMembers() {
    this.memberService.getMembers().subscribe((data: Array<object>) => {
      var mems = data as Member[];
      mems.sort(function(a, b) {
        var textA = a.name.toUpperCase();
        var textB = b.name.toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
      });
      this.memberService.members = mems;
    });
  }

  // Triggered when an admin hits "Review Requests" -> ensures the requests shown are up-to-date
  onReviewRequestsOpened() {
    this.refreshRequests();
  }

  // Makes a new Request of type Excused Absence and saves it to the database.
  // Takes an excused absence date of, for example, January 2nd, 2019 and turns it into 20190102 so that it can be saved as a number in the DB
  onExcuseRequestSubmit(form: NgForm) {
    var dd = (form.value.date.getDate()).toString();
    if (dd.length < 2 && dd.charAt(0) != '0')
      dd = '0' + dd;

    var mm = (form.value.date.getMonth() + 1).toString();
    if (mm.length < 2 && mm.charAt(0) != '0')
      mm = '0' + mm;

    var yyyy = form.value.date.getFullYear();

    var strDate = yyyy + '/' + mm + '/' + dd;
    strDate = strDate.replace(/\//g, '');  // Turns 2019/01/02 into 20190102 to be stored in the database as a number

    // Create new Request to be saved
    var request = new Request();
    request.type = "Excused Absence";
    request.value = parseInt (strDate);
    request.description = form.value.reason;
    request.submittedById = this.userId;
    request.submittedBy = this.user;
    request.submittedDate = this.getCurrentDateTime();
    request.approved = 0;

    // Save Request to DB
    this.requestsService.postRequest(request).subscribe((res) => {
      $("#excuseSubmitModal").modal("hide");
      this.getRequests();
      this.toastr.success('Excused absence request submitted');
    });
  }

  // Saves the Request of type Brotherhood Points to the DB
  onPointRequestSubmit(form: NgForm) {
    var request = new Request();
    request.type = "Brotherhood Points";
    request.value = form.value.points;
    request.description = form.value.description;
    request.submittedById = this.userId;
    request.submittedBy = this.user;
    request.submittedDate = this.getCurrentDateTime();
    request.approved = 0;
    this.requestsService.postRequest(request).subscribe((res) => {
      $("#pointsSubmitModal").modal("hide");
      this.getRequests();
      this.toastr.success('Point request submitted');
    });
  }

  // Saves the Request of type Service Hours to the DB
  onServiceHourRequestSubmit(form: NgForm) {
    var request = new Request();
    request.type = "Service Hours";
    request.value = form.value.serviceHours;
    request.description = form.value.description;
    request.submittedById = this.userId;
    request.submittedBy = this.user;
    request.submittedDate = this.getCurrentDateTime();
    request.approved = 0;
    this.requestsService.postRequest(request).subscribe((res) => {
      $("#serviceHoursSubmitModal").modal("hide");
      this.getRequests();
      this.toastr.success('Service Hours request submitted');
    });
  }

  // Gets the current date and time
  getCurrentDateTime() {
    var currentdate = new Date();
    var datetime = (currentdate.getMonth()+1) + "/"
                    + currentdate.getDate()  + "/"
                    + currentdate.getFullYear() + " "
                    + currentdate.getHours() + ":"
                    + currentdate.getMinutes() + ":"
                    + currentdate.getSeconds();

    return datetime;
  }

  // Gets up to date requests from the DB.
  // Also checks to see if any requests are available (requests that have approved property of 0 means they haven't been approved/denied yet)
  getRequests() {
    this.requestsService.getRequests().subscribe((data: Array<object>) => {
      this.requestsService.requests = data as Request[];
      for(var i = 0; i < this.requestsService.requests.length; i++) {
        if(this.requestsService.requests[i].approved == 0) {
           this.requestsService.numRequestsAvailable = 1;
           break;
        }
        else this.requestsService.numRequestsAvailable = 0;
      }
    });
  }

  // Update member's points or service hours and PUTs the member to the database to be upated.
  // Since we're keeping approved requests in the database, PUT the request to the DB as well with an approved property of 1.
  onAcceptRequest(request: Request) {
    this.memberService.getMemberById(request.submittedById).subscribe((res) => {
      var member = res as Member;
      if(request.type == "Brotherhood Points") {
        member.points = member.points + request.value;
      }
      else if(request.type == "Service Hours") {
        member.serviceHours = member.serviceHours + request.value;
      }
      this.memberService.putMember(request.submittedById, member).subscribe((res) => {
        if(request.type == "Brotherhood Points") { this.toastr.success('Brotherhood point request accepted for ' + request.submittedBy); }
        else if(request.type == "Excused Absence") { this.toastr.success('Excused absence request accepted for ' + request.submittedBy); }
        else if(request.type == "Service Hours") { this.toastr.success('Service hours request accepted for ' + request.submittedBy); }
        request.approved = 1;
        this.requestsService.putRequest(request._id, request).subscribe((res) => {
          this.refreshRequests();
          this.getMembers();
        });
      });
    });
  }

  // Don't update member's points or service hours and delete the request from the DB because we don't keep track of denied requests
  onDenyRequest(request: Request) {
    this.requestsService.deleteRequest(request._id).subscribe((res) => {
      this.refreshRequests();
      if(request.type == "Brotherhood Points")
        this.toastr.error('Brotherhood point request denied for ' + request.submittedBy);
      else if(request.type == "Service Hours")
        this.toastr.error('Service hour request denied for ' + request.submittedBy);
      else if(request.type == "Excused Absence")
        this.toastr.error('Excused absence request denied for ' + request.submittedBy);
    });
  }

  // Shows the history of the member clicked on -> shows the history of all approved requests for this member
  onShowHistory(id) {
    this.getRequests();
    $("#historyModal").modal("show");
    for(var i = 0; i < this.requestsService.requests.length; i++) {
      if(this.requestsService.requests[i].submittedById == id && this.requestsService.requests[i].approved == 1) {
        this.currentHistoryMember = this.requestsService.requests[i].submittedBy;
        this.membersRequests.push(this.requestsService.requests[i]);
      }
    }
  }

  // Called when the history modal is closed -> resets membersRequests to empty
  onHistoryClosed() {
    this.membersRequests = [];
  }

}
