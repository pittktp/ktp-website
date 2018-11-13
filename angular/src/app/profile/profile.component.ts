import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../auth.service';
import { MemberService } from '../shared/api/member.service';
import { RequestsService } from '../shared/api/requests.service';
import { SharedService } from '../shared.service';
import { Member } from '../shared/models/member.model';
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
  courseCategories: Array<String> = [];
  panelHtml: string = '';
  panelType: string = '';
  targetFile: File = null;
  courseList: Array<String> = [];
  private sub: any

  constructor(private toastr: ToastrService, private auth: AuthService, private memberService: MemberService, private requestService: RequestsService, private router: Router, private route: ActivatedRoute, private sharedService: SharedService) { }

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
        document.getElementById('descBtn').style.backgroundColor = 'rgb(231, 231, 231)';
        document.getElementById('descBtn').style.color = '#00415d';

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
    var tabs = document.getElementsByClassName("tab-btn") as HTMLCollectionOf<HTMLElement>;
    var targetTab = document.getElementById(tabId);

    // Reset colors
    for(var i = 0; i < tabs.length; i++) {
      tabs[i].style.backgroundColor = 'rgb(80, 80, 80)';
      tabs[i].style.color = 'white';
    }

    // Set targetted tab colors
    targetTab.style.backgroundColor = 'rgb(231, 231, 231)';
    targetTab.style.color = '#00415d';
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

  handleFileUpload(files: FileList) {
    this.targetFile = files.item(0);
  }

  onChangePicture(form: NgForm) {
    this.memberService.postFile(this.auth.getCurrentUserId(), this.targetFile).subscribe(res => {
      console.log('Post Sucessful!');
    }, error => {
      console.error(error);
    });
  }

  onChangeDescription(form: NgForm) {
    var desc = form.value.desc;
    
    this.memberService.putDescription(this.auth.getCurrentUserId(), desc).subscribe(res => {
      console.log('Put Successful!');
    }, error => {
      console.error(error);
    });
  }

  onChangeMajor(form: NgForm) {
    var major = form.value.major;

    this.memberService.putMajor(this.auth.getCurrentUserId(), major).subscribe(res => {
      console.log('Put Successful!');
    }, error => {
      console.error(error);
    });
  }

  onChangeGraduation(form: NgForm) {
    var gradSemester = form.value.gradSemester;

    this.memberService.putGradSemester(this.auth.getCurrentUserId(), gradSemester).subscribe(res => {
      console.log('Put Successful!');
    }, error => {
      console.error(error);
    });
  }

  onAddCourse(form: NgForm) {
    var course = form.value.addCourse;

    // Check that course isnt already in courselist

    this.memberService.putCourse(this.auth.getCurrentUserId(), course).subscribe(res => {
      console.log('Put Successful!');
    }, error => {
      console.error(error);
    });
  }

  onRemoveCourse(form: NgForm) {
    // Get course
    var course = form.value.removeCourse;
    // Get User Course List
    this.memberService.getMemberById(this.auth.getCurrentUserId()).subscribe(data => {
      var member = data as Member;
      this.courseList = member.courses;
    });
    // Traverse list until course is found
    for(var i = 0; i < this.courseList.length; i++) {
      if(this.courseList[i] === course) {
        this.courseList.splice(i, 1);
        break;
      } else if(i == this.courseList.length-1) {
        // Error: Requested Course is not in member course list
        console.error('Member has not taken course: ', course);
      }
    }
    // Remove course from the list, update in DB
    this.memberService.deleteCourse(this.auth.getCurrentUserId(), course).subscribe(res => {
      console.log('Delete Successful!');
    }, error => {
      console.error(error);
    });
  }
}
