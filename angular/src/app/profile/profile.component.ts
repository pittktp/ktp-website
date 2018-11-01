import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../auth.service';
import { MemberService } from '../shared/api/member.service';
import { RequestsService } from '../shared/api/requests.service';
import { SharedService } from '../shared.service';
import { Member } from '../shared/models/member.model';
import { PictureRequest } from '../shared/models/pictureRequest.model';
import { ToastrService } from 'ngx-toastr';

import '../../assets/js/new-age.min.js';

declare var $: any;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  id: number
  profile: Member
  private sub: any

  constructor(private toastr: ToastrService, private auth: AuthService, private memberService: MemberService, private requestService: RequestsService, private router: Router, private route: ActivatedRoute, private sharedService: SharedService) {

  }

  ngOnInit() {
    this.loadScript('../assets/js/new-age.js');

    this.route.params.forEach(params => {
      this.id = +params['id'];

      // TODO: Change to its own API call for simplicity
      this.memberService.getMembers().subscribe((data: Array<object>) => {
        var mems = data as Member[];
        for(var i = 0; i < mems.length; i++) {
          if(mems[i].studentId == this.id) {
            this.profile = mems[i];
            break;
          }
        }
      });
    });
  }
  
  loadScript(src) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    document.getElementsByTagName("body")[0].appendChild(script);
    script.src = src;
  }

  
  onChangePictureSubmit(form: NgForm) {
    var request = new PictureRequest();
    request.filename = form.value.picture.split("\\").pop();
    request.submittedById = this.auth.getCurrentUserId();
    // Save picture in assets/img/profiles folder

    // Store filename in DB
    // this.requestService.postPictureRequest(request).subscribe(res => {
    //   $("#profileSettingsModal").modal("hide");
    //   this.toastr.success('Profile Picture has been updated');
    // });
  }
}
