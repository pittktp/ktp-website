import { Component, OnInit } from '@angular/core';
import {Member} from '../shared/models/member.model';
import {MemberService} from '../shared/api/member.service';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.css']
})
export class MembersComponent implements OnInit {

  protected members: Member[] = [];

  constructor(private memberService: MemberService) {}

  static loadScript(src) {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    document.getElementsByTagName('body')[0].appendChild(script);
    script.src = src;
  }

  ngOnInit() {
    MembersComponent.loadScript('../assets/js/new-age.js');
    this.getMembers();
  }

  getMembers() {
    this.memberService.getMembers().subscribe((data: Array<object>) => {
      this.members = data as Member[];
    });
  }

}
