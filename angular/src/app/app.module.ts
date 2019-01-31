import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { JwtModule } from '@auth0/angular-jwt';
import { CommonModule } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BsDatepickerModule } from 'ngx-bootstrap';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { PointsComponent } from './points/points.component';
import { NavComponent } from './nav/nav.component';
import { AuthService } from './shared/auth/auth.service';
import { AuthGuard } from './shared/auth/auth.guard';
import { AppRoutingModule } from './shared/routing/app-routing.module';
import { EditMembersComponent } from './edit-members/edit-members.component';
import { MembersComponent } from './members/members.component';
import { ProfileComponent } from './profile/profile.component';


export function tokenGetter() {
  return localStorage.getItem('access_token');
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    PointsComponent,
    NavComponent,
    EditMembersComponent,
    MembersComponent,
    ProfileComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    HttpClientModule,
    BsDatepickerModule.forRoot(),
    FormsModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-left'
    }),
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        whitelistedDomains: ['localhost:3000'],
        blacklistedRoutes: [
          'localhost:3000/api/auth',
          'localhost:3000/api/members',
          'localhost:3000/api/points'
        ]
      }
    }),
    AppRoutingModule
  ],
  providers: [
    AuthService,
    AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
