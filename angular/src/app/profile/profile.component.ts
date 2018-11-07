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

  id: string
  profile: Member
  hoursPercent: number;
  pointsPercent: number;
  currentTabContent: string;
  currentTab: string;
  courseCategories: Array<String> = [];
  panelHtml: string = '';
  panelType: string = '';
  private sub: any

  constructor(private toastr: ToastrService, private auth: AuthService, private memberService: MemberService, private requestService: RequestsService, private uploadService: UploadsService, private router: Router, private route: ActivatedRoute, private sharedService: SharedService) { }

  ngOnInit() {
    this.loadScript('../assets/js/new-age.js');

    this.route.params.forEach(params => {
      this.id = params['id'];

      // TODO: Change to its own API call for simplicity
      this.memberService.getMembers().subscribe((data: Array<object>) => {
        var mems = data as Member[];
        for(var i = 0; i < mems.length; i++) {
          if(mems[i].email.split('@')[0] == this.id) {
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

        // Set Up Default Tabbing
        this.currentTabContent = 'description';
        this.currentTab = 'descBtn';
        document.getElementById(this.currentTab).style.backgroundColor = 'rgb(231, 231, 231)';
        document.getElementById(this.currentTab).style.color = '#00415d';

        // Set Up Courses Taken for Accordion
        for(var i = 0; i < this.profile.courses.length; i++) {
          var courseCategory = this.profile.courses[i].split(" ")[0];
          if(!this.courseCategories.includes(courseCategory)) {
            this.courseCategories.push(courseCategory);
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

  openTab(contentId: string, tabId: string) {
    this.currentTabContent = contentId;
    this.currentTab = tabId;
    if(tabId === 'acadBtn') {
      document.getElementById(this.currentTab).style.backgroundColor = 'rgb(231, 231, 231)';
      document.getElementById(this.currentTab).style.color = '#00415d';

      document.getElementById('descBtn').style.backgroundColor = 'rgb(80, 80, 80)';
      document.getElementById('descBtn').style.color = 'white';
    }
    if(tabId === 'descBtn') {
      document.getElementById(this.currentTab).style.backgroundColor = 'rgb(231, 231, 231)';
      document.getElementById(this.currentTab).style.color = '#00415d';

      document.getElementById('acadBtn').style.backgroundColor = 'rgb(80, 80, 80)';
      document.getElementById('acadBtn').style.color = 'white';
    }
  }
  
  selectCourseCategory(category: string) {
    if(this.panelHtml == '') {
      // Opens panel on first click
      for(var i = 0; i < this.profile.courses.length; i++) {
        var courseCategory = this.profile.courses[i].split(" ")[0];
        if(courseCategory === category) {
          this.panelHtml += `<p>${this.profile.courses[i]}</p>`;
        }
      }
      this.panelType = category;
    } else if(this.panelType != category) {
      // Closes open panel and opens newly clicked panel
      this.panelHtml = '';
      for(var i = 0; i < this.profile.courses.length; i++) {
        var courseCategory = this.profile.courses[i].split(" ")[0];
        if(courseCategory === category) {
          this.panelHtml += `<p>${this.profile.courses[i]}</p>`;
        }
      }
      this.panelType = category;
    } else {
      // Closes open panel, clears vars
      this.panelHtml = '';
      this.panelType = '';
    }
  }

  onChangePicture(form: NgForm) {
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

  onChangeDescription(form: NgForm) {

  }
}
