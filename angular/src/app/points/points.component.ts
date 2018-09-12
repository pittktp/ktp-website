import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { MemberService } from '../shared/api/member.service';
import { PointsService } from '../shared/api/points.service';
import { ServiceHourService } from '../shared/api/service-hour.service';
import { LoginComponent } from '../login/login.component';
import { Member } from '../shared/models/member.model';
import { PointRequest } from '../shared/models/point-request.model';
import { ServiceHourRequest } from '../shared/models/service-hour-request.model';
import { AuthService } from '../auth.service';
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
  pointForm: PointRequest = new PointRequest();

  constructor(private toastr: ToastrService, private auth: AuthService, private memberService: MemberService, private pointsService: PointsService, private serviceHourService: ServiceHourService, private router: Router) {
    if(this.auth.loggedIn()) {
      var currentUserId = this.auth.getCurrentUserId();
      this.userId = currentUserId;
      this.memberService.getMemberById(currentUserId).subscribe((res) => {
        var member = res as Member;
        this.user = member.name;
        this.userRole = member.role;
        if(member.role == 'admin') { this.getPointRequests(); }
      });
    }
  }

  ngOnInit() {
    this.loadScript('../assets/js/new-age.js');
    this.getMembers();
    if(this.userRole == 'admin') {
      this.getPointRequests();
      this.getServiceHourRequests();
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

  refreshPointRequests() {
    this.getPointRequests();
  }

  refreshServiceHourRequests() {
    this.getServiceHourRequests();
  }

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

  onReviewRequestsOpened() {
    this.refreshPointRequests();
  }

  onPointRequestSubmit(form: NgForm) {
    var pointRequest = new PointRequest();
    pointRequest.setPoints(form.value.points);
    pointRequest.setDescription(form.value.description);
    pointRequest.setSubmittedById(this.userId);
    pointRequest.setSubmittedBy(this.user);
    pointRequest.setApproved(0);
    this.pointsService.postPointRequest(pointRequest).subscribe((res) => {
      $("#pointsSubmitModal").modal("hide");
      this.getPointRequests();
      this.toastr.success('Point request submitted');
    });
  }

  onServiceHourRequestSubmit(form: NgForm) {
    var serviceHourRequest = new ServiceHourRequest();
    serviceHourRequest.serviceHours = form.value.serviceHours;
    serviceHourRequest.description = form.value.description;
    serviceHourRequest.submittedById = this.userId;
    serviceHourRequest.submittedBy = this.user;
    serviceHourRequest.approved = 0;
    this.serviceHourService.postServiceHourRequest(serviceHourRequest).subscribe((res) => {
      $("#serviceHoursSubmitModal").modal("hide");
      this.getPointRequests();
      this.toastr.success('Service Hours request submitted');
    });
  }

  getPointRequests() {
    this.pointsService.getPointRequests().subscribe((data: Array<object>) => {
      this.pointsService.pointRequests = data as PointRequest[];
    });
  }

  getServiceHourRequests() {
    this.serviceHourService.getServiceHourRequests().subscribe((data: Array<object>) => {
      this.serviceHourService.serviceHours = data as ServiceHourRequest[];
    });
  }

  // Update member's points and delete point request from DB
  onAcceptRequest(request: PointRequest) {
    this.memberService.getMemberById(request.submittedById).subscribe((res) => {
      var member = res as Member;
      member.points = member.points + request.points;
      this.memberService.putMember(request.submittedById, member).subscribe((res) => {
        this.toastr.success('Point request accepted for ' + request.submittedBy);
        this.pointsService.deletePointRequest(request._id).subscribe((res) => {
          this.refreshPointRequests();
          this.refreshServiceHourRequests();
          this.getMembers();
        });
      });
    });
  }

  // Don't update member's points - just delete point request from DB
  onDenyRequest(request: PointRequest) {
    this.pointsService.deletePointRequest(request._id).subscribe((res) => {
      this.refreshPointRequests();
      this.refreshServiceHourRequests();
      this.toastr.error('Point request denied for ' + request.submittedBy);
    });
  }

}
