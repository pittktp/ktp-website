import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { MemberService } from '../shared/api/member.service';
import { RequestsService } from '../shared/api/requests.service';
import { LoginComponent } from '../login/login.component';
import { Member } from '../shared/models/member.model';
import { Request } from '../shared/models/request.model';
import { AuthService } from '../shared/auth/auth.service';
import { ToastrService } from 'ngx-toastr';

import '../../assets/js/new-age.min.js';

declare var $: any;

@Component({
  selector: 'app-points',
  templateUrl: './points.component.html',
  styleUrls: ['./points.component.css']
})
export class PointsComponent implements OnInit {

  userId: string;
  user: string;
  userRole: string;
  requestForm: Request = new Request();

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

  ngOnInit() {
    this.loadScript('../assets/js/new-age.js');
    this.getMembers();
    if(this.userRole == 'admin') {
      this.getRequests();
     }
  }

  loadScript(src) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    document.getElementsByTagName("body")[0].appendChild(script);
    script.src = src;
  }

  refreshMembers() {
    this.getMembers();
  }

  refreshRequests() {
    this.getRequests();
  }

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

  onReviewRequestsOpened() {
    this.refreshRequests();
  }

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

  getCurrentDateTime() {
    var currentdate = new Date();
    var datetime = currentdate.getMonth() + "/"
                    + (currentdate.getDate()+1)  + "/"
                    + currentdate.getFullYear() + " "
                    + currentdate.getHours() + ":"
                    + currentdate.getMinutes() + ":"
                    + currentdate.getSeconds();

    return datetime;
  }

  getRequests() {
    this.requestsService.getRequests().subscribe((data: Array<object>) => {
      this.requestsService.requests = data as Request[];
    });
  }

  // Update member's points and delete point request from DB
  onAcceptRequest(request: Request) {
    this.memberService.getMemberById(request.submittedById).subscribe((res) => {
      var member = res as Member;
      if(request.type == "Brotherhood Points")
        member.points = member.points + request.value;
      else
        member.serviceHours = member.serviceHours + request.value;
      this.memberService.putMember(request.submittedById, member).subscribe((res) => {
        if(request.type == "Brotherhood Points") { this.toastr.success('Brotherhood point request accepted for ' + request.submittedBy); }
        else if(request.type == "Service Hours") { this.toastr.success('Service hours request accepted for ' + request.submittedBy); }
        this.requestsService.deleteRequest(request._id).subscribe((res) => {
          this.refreshRequests();
          this.getMembers();
        });
      });
    });
  }

  // Don't update member's points - just delete point request from DB
  onDenyRequest(request: Request) {
    this.requestsService.deleteRequest(request._id).subscribe((res) => {
      this.refreshRequests();
      if(request.type == "Brotherhood Points")
        this.toastr.error('Brotherhood point request denied for ' + request.submittedBy);
      else
        this.toastr.error('Service hour request denied for ' + request.submittedBy);
    });
  }

}
