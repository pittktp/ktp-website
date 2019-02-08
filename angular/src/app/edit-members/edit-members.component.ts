import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

import { AuthService } from '../shared/auth/auth.service';
import { MemberService } from '../shared/api/member.service';
import { SharedService } from '../shared/shared.service';
import { Member } from '../shared/models/member.model';
import { ToastrService } from 'ngx-toastr';

declare var $: any;

@Component({
  selector: 'app-edit-members',
  templateUrl: './edit-members.component.html',
  styleUrls: ['./edit-members.component.scss']
})

// The component that allows "admins" (anyone on eboard) to directly edit members of the frat.
// A use case for this would be if someone registers themselves and forgets to include their last name,
// an admin could edit this information in the database via this component.
export class EditMembersComponent implements OnInit {

  private memberClicked: Member;
  private userId: string;
  private userRole: string = '';

  // Constructor -> checks if user is logged in, if so, then retrieve their member object from the database.
  constructor(private toastr: ToastrService, private auth: AuthService, private router: Router, public memberService: MemberService, private sharedService: SharedService) {

    if(this.auth.loggedIn()) {
      var currentUserId = this.auth.getCurrentUserId();
      this.userId = currentUserId;
      this.memberService.getMemberById(this.userId).subscribe(res => {
        var member = res as Member;
        this.userRole = member.role;
        if(this.userRole != 'admin') {
          alert('You do not have permission to access this page');
          this.router.navigate(['home']);
        }
      });
    }  
  }

  // Pretty much like a constructor -> this gets a list of all members from DB everytime the component is loaded/refreshed
  ngOnInit() {
    this.loadScript('../assets/js/new-age.js');
    this.getMembers();
  }

  // A hacked up way to load the js script needed to perform the scrolling animations
  loadScript(src) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    document.getElementsByTagName("body")[0].appendChild(script);
    script.src = src;
  }

  // Gets all members from the DB and uses that response to update MemberService's members array property.
  // This function also alphabetizes this list of members based on name
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

  // When a member is clicked, mark them as current member clicked on and populate the
  // modal with their properties from DB.
  onMemberClicked(member: Member) {
    this.memberClicked = member;

    $('#points').val(this.memberClicked.points);
    $('#serviceHours').val(this.memberClicked.serviceHours);
    $('#absences').val(this.memberClicked.absences);
    $('#role').val(this.memberClicked.role);
    $('#name').val(this.memberClicked.name);

    $("#memberEditSubmitModal").modal("show");
  }

  // Deletes a member from the database then calls getMembers() to get the new list of
  // members without the deleted member
  onDeleteMember() {
    if(confirm("Delete member " + this.memberClicked.name + "?")) {
      if(this.userId == this.memberClicked._id)
        this.toastr.error("You can't delete yourself -_-");
      else {
        this.memberService.deleteMember(this.memberClicked._id).subscribe((res) => {
          this.getMembers();
          $("#memberEditSubmitModal").modal("hide");
          this.toastr.success('Successfully deleted member ' + this.memberClicked.name);
        });
      }
    }
  }

  // Called when the member is edited. Create a new Member object, get the information from the modal input fields,
  // and set the other properties to what they were before. Then PUT this new member to the DB and call getMembers() to reflect the change
  onEditMemberSubmit(form: NgForm) {

    var updatedMember: Member = new Member();
    updatedMember._id = this.memberClicked._id;
    updatedMember.email = this.memberClicked.email;

    updatedMember.name = $('#name').val();
    updatedMember.points = $('#points').val();
    updatedMember.serviceHours = $('#serviceHours').val();
    updatedMember.absences = $('#absences').val();
    updatedMember.role = $('#role').val();
    updatedMember.rushClass = this.memberClicked.rushClass;
    updatedMember.picture = this.memberClicked.picture;
    updatedMember.linkedIn = this.memberClicked.linkedIn;
    updatedMember.github = this.memberClicked.github;
    updatedMember.gradSemester = this.memberClicked.gradSemester;
    updatedMember.major = this.memberClicked.major;
    updatedMember.description = this.memberClicked.description;
    updatedMember.courses = this.memberClicked.courses;
    updatedMember.color = this.memberClicked.color;

    if(confirm("Finish editing member " + updatedMember.name + "?")) {
      this.memberService.putMember(this.memberClicked._id, updatedMember).subscribe((res) => {
        this.getMembers();
        $("#memberEditSubmitModal").modal("hide");
        this.toastr.success('Successfully edited member ' + res.name);
      });
    }
  }

}
