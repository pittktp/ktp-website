import { Component, OnInit } from '@angular/core';
import { Member } from '../shared/models/member.model';
import { MemberService } from '../shared/api/member.service';
import { AuthService } from '../shared/auth/auth.service';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.css']
})

// Component that can be viewed by anyone that lists all members and their name, description, and major.
// This component accesses a specific backend API endpoint that only returns back a list of members with
// properties "name", "major", and "description" because we don't want anyone not logged in to access other
// more sensative member information.
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

  // A hacked up way to load the js script needed for this component
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

  // Gets all members from DB using the backend API endpoint that only returns a list of members
  // with properties "name", "major", and "description"
  getMembers() {
    this.memberService.getBasicMembers().subscribe((data: Array<object>) => {
      this.members = data as Member[];
      this.members = this.members.map((m) => this.fillWithPlaceholderData(m));

      this.members.sort(function(a, b) {
        var textA = a.name.toUpperCase();
        var textB = b.name.toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
      });
    });
  }

  // Fills each member card with the member's name, major, and description.
  // If they don't have their major or description set, it'll fill it with placeholder text
  fillWithPlaceholderData(member: Member): Member {
    const filledMember = {...member};

    filledMember.description = (member.description === '') ? this.descriptionPlaceholder : member.description;
    filledMember.major = (member.major === '') ? this.majorPlaceholder : member.major;
    filledMember._id = member.email.split('@')[0];
    return filledMember;
  }

  // Gets the members initials to be used as the member's profile picture
  initialsFrom(fullName: string): string {
    const names = fullName.split(' ');
    return names[0][0] + names[names.length - 1][0];
  }

  getMemberPicture(member: Member) {
    return member.picture;
  }
}
