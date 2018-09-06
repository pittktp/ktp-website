import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { MemberService } from '../shared/api/member.service';
import { PointsService } from '../shared/api/points.service';
import { LoginComponent } from '../login/login.component';
import { Member } from '../shared/models/member.model';
import { PointRequest } from '../shared/models/point-request.model';
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
  userName: string;
  userPriviledge: string;
  pointForm: PointRequest = new PointRequest();

  private members: Array<object> = [];
  private pointRequests: Array<object> = [];

  constructor(private toastr: ToastrService, private auth: AuthService, private memberService: MemberService, private pointsService: PointsService, private router: Router) {
    if(this.auth.loggedIn()) {
      var currentUserId = this.auth.getCurrentUserId();
      this.userId = currentUserId;
      this.memberService.getMemberById(currentUserId).subscribe((res) => {
        var member = res as Member;
        this.userName = member.name;
        this.userPriviledge = member.role;
        if(member.role == 'admin') { this.getPointRequests(); }
      });
    }
  }

  ngOnInit() {
    this.loadScript('../assets/js/new-age.js');
    this.getMembers();
    if(this.userPriviledge == 'admin') { this.getPointRequests(); }
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

  getMembers() {
    this.memberService.getMembers().subscribe((data: Array<object>) => {
      var mems = data as Member[]
      mems.sort(function(a, b) {
        var textA = a.name.toUpperCase();
        var textB = b.name.toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
      });
      this.members = data;
    });
  }

  onPointRequestSubmit(form: NgForm) {
    var pointRequest = new PointRequest();
    pointRequest.setPoints(form.value.points);
    pointRequest.setDescription(form.value.description);
    pointRequest.setSubmittedById(this.userId);
    pointRequest.setSubmittedBy(this.userName);
    pointRequest.setApproved(0);
    this.pointsService.postPointRequest(pointRequest).subscribe((res) => {
      $("#pointsSubmitModal").modal("hide");
      this.getPointRequests();
      this.toastr.success('Point request submitted');
    });
  }

  getPointRequests() {
    this.pointsService.getPointRequests().subscribe((data: Array<object>) => {
      this.pointRequests = data;
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
          this.getMembers();
        });
      });
    });
  }

  // Don't update member's points - just delete point request from DB
  onDenyRequest(request: PointRequest) {
    this.pointsService.deletePointRequest(request._id).subscribe((res) => {
      this.refreshPointRequests();
    });
  }

}
