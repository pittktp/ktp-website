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

import '../../assets/js/new-age.min.js';


declare var $: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
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

  loadScript(src) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    document.getElementsByTagName("body")[0].appendChild(script);
    script.src = src;
  }

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
        if(err.status == 409)
          this.emailInUse = true;
        if(err.status == 401)
          this.validCode = false;
      }
    );

  }

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

  onEmailKeyForgotPassword() {
    var testEmail = /^[A-Z0-9._%+-]+@([A-Z0-9-]+\.)+[A-Z]{2,4}$/i;
    if(testEmail.test($('#pittEmail').val()))
      this.validEmailForgotPassword = true;
    else
      this.validEmailForgotPassword = false;
  }

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
