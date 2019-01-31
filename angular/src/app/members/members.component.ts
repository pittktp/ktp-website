import { Component, OnInit } from '@angular/core';
import { Member } from '../shared/models/member.model';
import { MemberService } from '../shared/api/member.service';
import { AuthService } from '../shared/auth/auth.service';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.css']
})
export class MembersComponent implements OnInit {

  private readonly majorPlaceholder = 'Undeclared';
  private readonly descriptionPlaceholder = 'This person doesn\'t have a bio, but it\'s safe to assume they love technology.';

  private userLoggedIn = false;
  protected members: Member[] = [];

  constructor(private memberService: MemberService, private authService: AuthService) {
    if(this.authService.loggedIn()) {
      this.userLoggedIn = true;
    }
    else {
      this.userLoggedIn = false;
    }
  }

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
    this.memberService.getBasicMembers().subscribe((data: Array<object>) => {
      this.members = data as Member[];
      this.members = this.members.map((m) => this.fillWithPlaceholderData(m));
    });
  }

  fillWithPlaceholderData(member: Member): Member {
    const filledMember = {...member};

    filledMember.description = (member.description === '') ? this.descriptionPlaceholder : member.description;
    filledMember.major = (member.major === '') ? this.majorPlaceholder : member.major;
    filledMember._id = member.email.split('@')[0];
    return filledMember;
  }

  initialsFrom(fullName: string): string {
    const names = fullName.split(' ');
    return names[0][0] + names[names.length - 1][0];
  }
}
