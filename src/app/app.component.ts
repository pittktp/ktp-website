import { Component } from '@angular/core';
import { HomeComponent } from './home/home.component';

import { AuthService } from './auth.service';
import { Member } from './shared/models/member.model';
import { MemberService } from './shared/api/member.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(private auth: AuthService, private memberService: MemberService) {

  }

}
