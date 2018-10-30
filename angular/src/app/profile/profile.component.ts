import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../auth.service';
import { MemberService } from '../shared/api/member.service';
import { RequestsService } from '../shared/api/requests.service';
import { SharedService } from '../shared.service';
import { Member } from '../shared/models/member.model';
import { Request } from '../shared/models/request.model';
import { ToastrService } from 'ngx-toastr';

import '../../assets/js/new-age.min.js';

declare var $: any;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {

  id: number
  profile: Member
  private sub: any

  constructor(private toastr: ToastrService, private auth: AuthService, private memberService: MemberService, private requestService: RequestsService, private router: Router, private route: ActivatedRoute, private sharedService: SharedService) {
    if(!this.auth.loggedIn()) {
      this.router.navigate(['home']);
    }
  }

  ngOnInit() {
    this.loadScript('../assets/js/new-age.js');

    this.sub = this.route.params.forEach(params => {
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

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
