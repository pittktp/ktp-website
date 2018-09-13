import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

import { AuthService } from '../auth.service';
import { MemberService } from '../shared/api/member.service';
import { SharedService } from '../shared.service';
import { Member } from '../shared/models/member.model';
import { ToastrService } from 'ngx-toastr';

import '../../assets/js/new-age.min.js';

declare var $: any;

@Component({
  selector: 'app-edit-members',
  templateUrl: './edit-members.component.html',
  styleUrls: ['./edit-members.component.css']
})
export class EditMembersComponent implements OnInit {

  private memberClicked: Member;

  constructor(private toastr: ToastrService, private auth: AuthService, private router: Router, private memberService: MemberService, private sharedService: SharedService) {

  }

  ngOnInit() {
    this.loadScript('../assets/js/new-age.js');
    this.getMembers();
  }

  loadScript(src) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    document.getElementsByTagName("body")[0].appendChild(script);
    script.src = src;
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

  onMemberClicked(member: Member) {
    this.memberClicked = member;

    $('#studentId').val(this.memberClicked.studentId);
    $('#points').val(this.memberClicked.points);
    $('#serviceHours').val(this.memberClicked.serviceHours);
    $('#absences').val(this.memberClicked.absences);
    $('#role').val(this.memberClicked.role);
    $('#name').val(this.memberClicked.name);

    $("#memberEditSubmitModal").modal("show");
  }

  onDeleteMember() {
    if(confirm("Delete member " + this.memberClicked.name + "?")) {
      this.memberService.deleteMember(this.memberClicked._id).subscribe((res) => {
        this.getMembers();
        $("#memberEditSubmitModal").modal("hide");
        this.toastr.success('Successfully deleted member ' + this.memberClicked.name);
      });
    }
  }

  onEditMemberSubmit(form: NgForm) {

    var updatedMember: Member = new Member();
    updatedMember._id = this.memberClicked._id;
    updatedMember.email = this.memberClicked.email;

    updatedMember.name = $('#name').val();
    updatedMember.studentId = $('#studentId').val();
    updatedMember.points = $('#points').val();
    updatedMember.serviceHours = $('#serviceHours').val();
    updatedMember.absences = $('#absences').val();
    updatedMember.role = $('#role').val();

    if(confirm("Finish editing member " + updatedMember.name + "?")) {
      this.memberService.putMember(this.memberClicked._id, updatedMember).subscribe((res) => {
        this.getMembers();
        $("#memberEditSubmitModal").modal("hide");
        this.toastr.success('Successfully edited member ' + res.name);
      });
    }
  }

}
