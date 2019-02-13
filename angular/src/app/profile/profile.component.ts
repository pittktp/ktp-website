import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../shared/auth/auth.service';
import { MemberService } from '../shared/api/member.service';
import { RequestsService } from '../shared/api/requests.service';
import { SharedService } from '../shared/shared.service';
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

  private picture = "";

  id: string
  profile: Member;
  picLetters: string = '';
  hoursPercent: number;
  pointsPercent: number;
  currentTabContent: string;
  courseCategories: Array<String> = [];
  panelHtml: string = '';
  panelType: string = '';
  targetFile: File = null;
  courseList: Array<String> = [];
  private sub: any;

  constructor(private toastr: ToastrService, private auth: AuthService, public memberService: MemberService, private requestService: RequestsService, private router: Router, private route: ActivatedRoute, private sharedService: SharedService) {

  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.id = params['id']
      this.memberService.getMembers().subscribe((data: Array<object>) => {
        var memberList = data as Array<Member>;
        for(var i = 0; i < memberList.length; i++) {
          if(memberList[i].email.split('@')[0] == this.id) {
            this.profile = memberList[i];
            this.picture = this.profile.picture;
          }
        }
        // Ensure no name bugs
        if(this.profile.name.indexOf(' ') >= 0) { // Has first and last
          var splitName = this.profile.name.split(" ")
          this.picLetters = splitName[0].charAt(0) + splitName[1].charAt(0);
        } else { // Has only first
          this.picLetters = this.profile.name.charAt(0);
        }

        // Ensure their hours and points percentage doesnt exceed 100%
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

        var headerElem = document.getElementById('prof-bg');
        var serviceElem = document.getElementById('service');
        var pointsElem = document.getElementById('points');
        if(this.profile.color !== null) {
          headerElem.style.setProperty('--prof-color1', this.profile.color[0]);
          headerElem.style.setProperty('--prof-color2', this.profile.color[1]);
          serviceElem.style.setProperty('--prof-color1', this.profile.color[0]);
          pointsElem.style.setProperty('--prof-color2', this.profile.color[1]);
        }
      })
    })
    this.loadScript('../assets/js/new-age.js');
  }

  // A hacked up way to load the js script needed for this component
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
    var member = this.profile
    if(this.panelHtml == '') {
      // Opens panel on first click
      for(var i = 0; i < member.courses.length; i++) {
        var courseCategory = member.courses[i].split(" ")[0];
        if(courseCategory === category) {
          this.panelHtml += `<p>${member.courses[i]}</p>`;
        }
      }
      this.panelType = category;
    } else if(this.panelType != category) {
      // Closes open panel and opens newly clicked panel
      this.panelHtml = '';
      for(var i = 0; i < member.courses.length; i++) {
        var courseCategory = member.courses[i].split(" ")[0];
        if(courseCategory === category) {
          this.panelHtml += `<p>${member.courses[i]}</p>`;
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
    // TODO: Ensure image is proper file type and is a square shape
    if(this.targetFile.type != "image/jpeg" && this.targetFile.type != "image/png" && this.targetFile.type != "image/gif") {
      this.showError("Invalid Image Type");
    } else {
      // Update in DB
      var fileType = this.targetFile.name.split(".")[1];
      var fileName = this.id + "." + fileType;
      this.memberService.postFile(this.auth.getCurrentUserId(), this.targetFile, this.id, fileName).subscribe(res => {
        console.log(res);
        this.showMsg("Reloading...");
        this.showMsg("Profile Image Updated!");
        setTimeout(() => {window.location.reload();}, 1500);
      }, error => {
        console.error(error);
        this.showError("Failed to Update Image!");
      });
    }
  }

  onChangeDescription(form: NgForm) {
    var member = this.profile;
    member.description = form.value.description;

    // Update User
    this.memberService.putMember(this.auth.getCurrentUserId(), member).subscribe(res => {
      this.showMsg("Description Updated!");
    }, error => {
      console.error(error);
      this.showError("Failed to Update Description!");
    });
  }

  onChangeColors(form: NgForm) {
    var member = this.profile;
    var color1 = form.value.color1;
    var color2 = form.value.color2;


    if(color1 === null || color1 === undefined) {
      color1 = member.color[0];
    }
    if(color2 === null || color2 === undefined) {
      color2 = member.color[1];
    }

    var isValid = this.validateColors(color1, color2);
    if(isValid) {
      member.color = [color1, color2];
    }

    this.memberService.putMember(this.auth.getCurrentUserId(), member).subscribe(res => {
      this.showMsg("Reloading...");
      this.showMsg("Colors Updated");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }, error => {
      console.error(error);
      this.showError("Failed to Update Colors!");
    })
  }

  validateColors(color1: string, color2: string) {
    // Ensure both colors are base-16
    if(color1.indexOf("#") === -1) {
      this.showError("Color 1 is not a Hexadecimal Value!");
      return false;
    }
    if(color2.indexOf("#") === -1) {
      this.showError("Color 2 is not a Hexadecimal Value!");
      return false;
    }
    // Ensure both colors have 6 hex digits and a digit for #
    if(color1.length != 7) {
      this.showError("Color 1 is invalid!")
      return false;
    }
    if(color2.length != 7) {
      this.showError("Color 2 is invalid!")
      return false;
    }
    return true;
  }

  onChangeMajor(form: NgForm) {
    var member = this.profile;
    member.major = form.value.major;

    // Update User
    this.memberService.putMember(this.auth.getCurrentUserId(), member).subscribe(res => {
      this.showMsg("Major Updated!");
    }, error => {
      console.error(error);
      this.showError("Failed to Update Major!");
    });
  }

  onChangeGraduation(form: NgForm) {
    var member = this.profile;
    member.gradSemester = form.value.gradSemester;

    // Update User
    this.memberService.putMember(this.auth.getCurrentUserId(), member).subscribe(res => {
      this.showMsg("Grad Semester Updated!");
    }, error => {
      console.error(error);
      this.showError("Failed to Update Grad Semester!");
    });
  }

  onChangeRushClass(form: NgForm) {
    var member = this.profile;
    member.rushClass = form.value.rushClass;

    // Update User
    this.memberService.putMember(this.auth.getCurrentUserId(), member).subscribe(res => {
      this.showMsg("Rush Class Updated!");
    }, error => {
      console.error(error);
      this.showError("Failed to Update Rush Class!");
    });
  }

  onChangeLinkedIn(form: NgForm) {
    var member = this.profile;
    member.linkedIn = form.value.linkedIn;

    // Update User
    this.memberService.putMember(this.auth.getCurrentUserId(), member).subscribe(res => {
      this.showMsg("LinkedIn Link Updated!");
    }, error => {
      console.error(error);
      this.showError("Failed to Update LinkedIn Link!");
    });
  }

  onChangeGithub(form: NgForm) {
    var member = this.profile;
    member.github = form.value.github;

    // Update User
    this.memberService.putMember(this.auth.getCurrentUserId(), member).subscribe(res => {
      this.showMsg("Github Link Updated!");
    }, error => {
      console.log(error);
      this.showError("Failed to Update Github Link!");
    });
  }

  onAddCourses(form: NgForm) {
    var courseList = form.value.addCourse;
    if(courseList.indexOf(", ") == -1) {
      // There is only 1 course
      this.onAddCourse(courseList);
    } else {
      // There are multiple courses
      var courses = courseList.split(", ");
      var member = this.profile;
      for(var i = 0; i < courses.length; i++) {
        // Validate Course
        var isValid = this.validateAdd(courses[i]);

        if(isValid) {
          // Add course
          member.courses.push(courses[i]);
        } else {
          for(var j = 0; j < i; j++) {
            member.courses.pop();
          }
          break;
        }
      }
      // Update User if all courses are valid
      if(isValid) {
        this.updateAdd(member);
      }
    }
  }

  onAddCourse(course: string) {
    var member = this.profile;
    // Validate Course
    var isValid = this.validateAdd(course);
    // Add course and update user if valid
    if(isValid) {
      member.courses.push(course);
      this.updateAdd(member);
    }
  }

  onRemoveCourses(form: NgForm) {
    var courseList = form.value.removeCourse;
    if(courseList.indexOf(", ") == -1) {
      // There is only 1 course
      this.onRemoveCourse(courseList);
    } else {
      // There are multiple courses
      var courses = courseList.split(", ");
      var member = this.profile;
      for(var i = 0; i < courses.length; i++) {
        // Validate course
        var isValid = this.validateRemove(courses[i]);

        if(isValid) {
          // Remove Course
          member.courses.splice(member.courses.indexOf(courses[i]), 1);
        } else {
          for(var j = 0; j < i; j++) {
            member.courses.push(courses[j])
          }
          break;
        }
      }
      // Update User if all Courses are valid
      if(isValid) {
        this.updateRemove(member);
      }
    }
  }

  onRemoveCourse(course: string) {
    var member = this.profile;

    // Validate Course
    var isValid = this.validateRemove(course)

    if(isValid) {
      // Remove course and update user
      member.courses.splice(member.courses.indexOf(course), 1);
      this.updateRemove(member);
    }
  }

  updateAdd(member: Member) {
    this.memberService.putMember(this.auth.getCurrentUserId(), member).subscribe(res => {
      this.showMsg("Added Course(s)!");
      // Updates the current member to reflect the new course(s) added
      this.memberService.getMemberById(this.profile._id).subscribe((res) => {
        this.profile = res as Member;
      });
    }, error => {
      console.error(error);
      this.showError("Failed to add Course(s)!");
    });
  }

  updateRemove(member: Member) {
    this.memberService.putMember(this.auth.getCurrentUserId(), member).subscribe(res => {
      this.showMsg("Course(s) Removed!");
      // Updates the current member to reflect the course(s) deleted
      this.memberService.getMemberById(this.profile._id).subscribe((res) => {
        this.profile = res as Member;
      });
    }, error => {
      console.error(error);
      this.showError("Failed to Remove Course(s)!");
    });
  }

  // Returns true on successful validation, false otherwise
  validateAdd(course: string) {
    var member = this.profile;
    // Check that course isnt already in courselist
    if(member.courses.indexOf(course) != -1) {
      // Display snackbar error
      this.showError("Course Already Exists!");
      return false;
    }

    // Ensure course follows proper format
    if(!course.match(/^[A-Z]* \d{4}$/)) {
      // Display snackbar error
      this.showError("Invalid Course Format!");
      return false;
    }

    return true;
  }

  // Returns true if course doesn't already exist, false otherwise
  validateRemove(course: string) {
    var member = this.profile;

    // Ensure course follows proper format
    if(!course.match(/^[A-Z]* \d{4}$/)) {
      // Display snackbar error
      this.showError("Invalid Course Format!");
      return false;
    }

    // Throw error if invalid course
    if(member.courses.indexOf(course) == -1) {
      // Display snackbar error
      this.showError("Invalid Course!");
      return false;
    }
    return true;
  }

  showMsg(msg: string) {
    this.toastr.success(msg);
  }

  showError(msg: string) {
    this.toastr.error(msg);
  }
}
