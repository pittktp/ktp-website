import { Component, OnInit } from '@angular/core';
import { AuthService } from '../shared/auth/auth.service';
import { SharedService } from '../shared/shared.service';
import { MemberService } from '../shared/api/member.service';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { NgForm } from '@angular/forms';
import { HttpResponse } from  '@angular/common/http';

import { Member } from '../shared/models/member.model';
import { ToastrService } from 'ngx-toastr';


declare var $: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

// Component that can be viewed when not logged in. It handles the logging in, registering, and forgot password functionality
export class LoginComponent implements OnInit {

  constructor(private toastr: ToastrService, private auth: AuthService, private router: Router, private sharedService: SharedService, public memberService: MemberService) { }

  error: string;
  showIncorrectLogin = false;
  passwordsMatch = true;
  validEmail = true;
  emailInUse = false;
  shortPassword = false;
  validCode = true;
  validEmailForgotPassword = true;
  passwordsMatchForgotPassword = true;
  shortPasswordForgotPassword = false;
  wrongCodeForgotPassword = false;
  invalidEmailForgotPassword = false;

  ngOnInit() {
    this.loadScript('../assets/js/new-age.js');
    this.loadScript('../assets/js/login.animations.js');
  }

  // A hacked up way to load the js scripts needed for this component
  loadScript(src) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    document.getElementsByTagName("body")[0].appendChild(script);
    script.src = src;
  }

  // Called when the user attempts a login. TBH, lifted this code from a tutorial, so not 100% how it works.
  // But it passes the email and password to the AuthService which then passes that to the backend which
  // queries the DB to see if that use exists and password is the same. If all good, we then retrieve the member
  // from the DB and notify the NavComponent (emitChange of the user's name, role, and id (jmd221 for example) so that
  // we can show "Jeremy Deppen", for example, in the navbar
  onSubmit(form: NgForm) {
    this.auth.login(form.value.email, form.value.password)
      .pipe(first())
      .subscribe((result) => {
        this.showIncorrectLogin = false;
        var currentUserId = this.auth.getCurrentUserId();
        this.memberService.getMemberById(currentUserId).subscribe((res) => {
          var member = res as Member;
          this.sharedService.emitChange({"name": member.name, "role": member.role, "id": member.email.split('@')[0]});
          this.router.navigate(['home']);
          this.toastr.show('Hello ' + member.name + "!");
        });
      },
        (err) => {
          this.showIncorrectLogin = true;
          $('#password').val("");
          this.error = 'Could not authenticate';
        }
      );
  }

  // Triggered on each keystroke in input box for confirming user's password
  onPasswordConfirmKey() {
    if($('#registerPassword').val().length < 6)
      this.shortPassword = true;
    else
      this.shortPassword = false;

    if($('#registerPassword').val() != $('#registerConfirmPassword').val())
      this.passwordsMatch = false;
    else
      this.passwordsMatch = true;
  }

  // Triggered on each keystroke in input box for user's email - checks if valid email using a regex
  onEmailKey() {
    var testEmail = /^[A-Z0-9._%+-]+@([A-Z0-9-]+\.)+[A-Z]{2,4}$/i;
    if(testEmail.test($('#registerEmail').val()))
      this.validEmail = true;
    else
      this.validEmail = false;
  }

  onCodeKey() {
    this.validCode = true;
  }

  // Called when a new user registers himself/herself.
  // Creates new member with default properties then POSTs the member to the backend.
  // If this email is already being used by another person in the DB, the backend will return
  // a 409 CONFLICT error, if so then display email currently in use. If the backend sends back
  // a 401 UNAUTHORIZED error, then the user supplied an invalid register code. If this is the case,
  // show a invalid code error to the user.
  onRegisterSubmit(form: NgForm) {

    var newMember: Member = new Member();

    newMember.name = form.value.registerName;
    newMember.email = form.value.registerEmail;
    newMember.password = form.value.registerPassword;
    newMember.points = 0;
    newMember.serviceHours = 0;
    newMember.absences = 0;
    newMember.code = form.value.registerCode;
    newMember.rushClass = "";
    newMember.picture = "";
    newMember.courses = [];
    newMember.linkedIn = "";
    newMember.github = "";
    newMember.gradSemester = "";
    newMember.major = "";
    newMember.description = "";
    newMember.color= ["#28B463", "#145BBD"];

    this.emailInUse = false;
    this.memberService.postMember(newMember).subscribe((res) => {
        this.auth.login(newMember.email, newMember.password)
          .pipe(first())
          .subscribe((result) => {
            this.showIncorrectLogin = false;
            var currentUserId = this.auth.getCurrentUserId();
            this.memberService.getMemberById(currentUserId).subscribe((res) => {
              var member = res as Member;
              this.sharedService.emitChange({"name": member.name, "role": member.role, "id": member.email.split('@')[0]});
              this.memberService.user = member.name;
              this.memberService.userRole = member.role;
              this.router.navigate(['home']);
              this.toastr.show('Welcome to the site ' + member.name + "!");
            });
          },
            (err) => {
              this.showIncorrectLogin = true;
              $('#password').val("");
              this.error = 'Could not authenticate';
            }
          );
      },
      (err) => {
        if(err.status == 409)  // Backend saying another member has this email
          this.emailInUse = true;
        if(err.status == 401)  // Backend saying the user supplied an invalid register code
          this.validCode = false;
      }
    );

  }

  // Called when a member clicked the forgot password modal and triggered on
  // each keystroke when the user is entering their new password to check if the passwords match
  onPasswordConfirmKeyForgotPassword() {
    if($('#newPassword').val().length < 6)
      this.shortPasswordForgotPassword = true;
    else
      this.shortPasswordForgotPassword = false;

    if($('#newPassword').val() != $('#retypeNewPassword').val())
      this.passwordsMatchForgotPassword = false;
    else
      this.passwordsMatchForgotPassword = true;
  }

  // Called when a member clicked the forgot password modal and triggered on
  // each keystroke when the user is entering their email.
  // This checks if its a valid email (of proper email format)
  onEmailKeyForgotPassword() {
    var testEmail = /^[A-Z0-9._%+-]+@([A-Z0-9-]+\.)+[A-Z]{2,4}$/i;
    if(testEmail.test($('#pittEmail').val()))
      this.validEmailForgotPassword = true;
    else
      this.validEmailForgotPassword = false;
  }

  // Called when a user enters their email, correct password reset code, and their new password.
  // This attempts to change the user's old password to this new password.
  // If backend returns a 401 UNAUTHORIZED error, the user supplied a wrong password reset code.
  // If backend returns a 404 NOT FOUND error, the email the user provided does not exist in the DB.
  onForgotPassword(form: NgForm) {
    this.memberService.updateMemberPassword(form.value.pittEmail, form.value.newPassword, form.value.code).subscribe((res) => {
        $("#forgotPasswordModal").modal("hide");
        this.toastr.success('Successfully changed password! Try logging in again');
      },
      (err) => {
        if(err.status == 401)
          this.wrongCodeForgotPassword = true;
        else if(err.status == 404)
          this.invalidEmailForgotPassword = true;
      }
    );
  }

}
