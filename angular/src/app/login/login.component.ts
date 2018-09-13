import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { SharedService } from '../shared.service';
import { MemberService } from '../shared/api/member.service';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { NgForm } from '@angular/forms';

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

  constructor(private toastr: ToastrService, private auth: AuthService, private router: Router, private sharedService: SharedService, private memberService: MemberService) { }

  error: string;
  showIncorrectLogin = false;
  passwordsMatch = true;
  validEmail = true;
  emailInUse = false;
  validCode = true;

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
          this.sharedService.emitChange({"name": member.name, "role": member.role});
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
    if($('#registerCode').val() == "g62dz9t4qm" || $('#registerCode').val() == "6edwxvuh06")
      this.validCode = true;
    else
      this.validCode = false;
  }

  onRegisterSubmit(form: NgForm) {

    this.memberService.getMembers().subscribe((data: Array<object>) => {
      var members = data as Member[];
      var exists = members.find(x => x.email === form.value.registerEmail);

      var newMember: Member = new Member();

      newMember.name = form.value.registerName.toLowerCase().split(' ').map(x=>x[0].toUpperCase()+x.slice(1)).join(' ');
      newMember.email = form.value.registerEmail;
      newMember.password = form.value.registerPassword;
      newMember.points = 0;
      newMember.serviceHours = 0;
      newMember.studentId = form.value.registerStudentId;
      newMember.absences = 0;

      if(form.value.registerCode == "g62dz9t4qm")  newMember.role = "member";
      else if(form.value.registerCode == "6edwxvuh06") newMember.role = "admin";

      if(exists == null) {
        this.emailInUse = false;
        this.memberService.postMember(newMember).subscribe((res) => {
          this.auth.login(newMember.email, newMember.password)
            .pipe(first())
            .subscribe((result) => {
              this.showIncorrectLogin = false;
              var currentUserId = this.auth.getCurrentUserId();
              this.memberService.getMemberById(currentUserId).subscribe((res) => {
                var member = res as Member;
                this.sharedService.emitChange({"name": member.name, "role": member.role});
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
        });
        this.router.navigate(['home']);
      }
      else {
        this.emailInUse = true;
      }
    });

  }

}
