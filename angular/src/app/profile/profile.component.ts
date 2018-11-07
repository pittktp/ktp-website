import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../auth.service';
import { MemberService } from '../shared/api/member.service';
import { RequestsService } from '../shared/api/requests.service';
import { UploadsService } from '../shared/api/upload.service';
import { SharedService } from '../shared.service';
import { Member } from '../shared/models/member.model';
import { Upload } from '../shared/models/upload.model';
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
  hoursPercent: number;
  pointsPercent: number;
  private sub: any

  constructor(private toastr: ToastrService, private auth: AuthService, private memberService: MemberService, private requestService: RequestsService, private uploadService: UploadsService, private router: Router, private route: ActivatedRoute, private sharedService: SharedService) { }

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
        // Ensure there hours and points percentage doesnt exceed 100%
        if(this.profile.serviceHours > 10) {
          this.hoursPercent = 100;
        } else {
          this.hoursPercent = (this.profile.serviceHours/10)*100;
        }
        if(this.profile.points > 5) {
          this.pointsPercent = 100;
        } else {
          this.pointsPercent = (this.profile.points/5)*100;
        }

        // Display Description Tab by Default
        document.getElementById("description").style.display = "block";
      });
    });
    
  }
  
  loadScript(src) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    document.getElementsByTagName("body")[0].appendChild(script);
    script.src = src;
  }

  openTab(id: string) {
    var i, tabContents, contentIndex, academicsTab, descriptionTab;

    // hide all tabs except current target
    tabContents = document.getElementsByClassName("tab-content");
    for(i = 0; i < tabContents.length; i++) {
      tabContents[i].style.display = "none";
      if(tabContents[i] == document.getElementById(id)) {
        contentIndex = i;
      }
    }
    tabContents[contentIndex].style.display = "block";

    academicsTab = document.getElementById("acadBtn");
    descriptionTab = document.getElementById("descBtn");

    if(id == "academics") {
      // Mark Academics Tab as Active
      academicsTab.style.backgroundColor = 'rgb(80, 80, 80)';
      academicsTab.style.color = 'white';

      // Mark Description Tab as Inactive
      descriptionTab.style.backgroundColor = 'rgb(231, 231, 231)';
      descriptionTab.style.color = '#00415d';
    } else {
      // Mark Description Tab as Active
      descriptionTab.style.backgroundColor = 'rgb(80, 80, 80)';
      descriptionTab.style.color = 'white';

      // Mark Academics Tab as Inactive
      academicsTab.style.backgroundColor = 'rgb(231, 231, 231)';
      academicsTab.style.color = '#00415d';
    }
  }

  
  onChangePictureSubmit(form: NgForm) {
    var upload = new Upload();
    upload.filename = form.value.picture.split("\\").pop();
    upload.submittedById = this.auth.getCurrentUserId();
    // Save picture in assets/img/profiles folder

    // Store filename in DB
    // this.requestService.postPictureRequest(request).subscribe(res => {
    //   $("#profileSettingsModal").modal("hide");
    //   this.toastr.success('Profile Picture has been updated');
    // });
  }
}
