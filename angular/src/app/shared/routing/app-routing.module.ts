import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from '../../login/login.component';
import { HomeComponent } from '../../home/home.component';
import { ProfileComponent } from '../../profile/profile.component';
import { PointsComponent } from '../../points/points.component';
import { EditMembersComponent } from '../../edit-members/edit-members.component';
import { MembersComponent } from '../../members/members.component';
import { NavComponent } from '../../nav/nav.component';
import { RushFormComponent } from '../../rush-form/rush-form.component';
import { AuthGuard } from '../auth/auth.guard';

// Class that handles how endpoints should route to their respective components.
// For example, if https://pitt-kappathetapi.com/points is accessed, it'll show the PointsComponent.
// The canActivate property is added to each path/component that should be restricted to only logged in users.

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'points', component: PointsComponent, canActivate: [AuthGuard] },
  { path: 'edit-members', component: EditMembersComponent, canActivate: [AuthGuard] },
  { path: 'members', component: MembersComponent },
  { path: 'login', component: LoginComponent },
  { path: 'profile/:id', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'rush', component: RushFormComponent },
  // otherwise redirect to home
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})],
  exports: [RouterModule]
})

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [RouterModule],
  declarations: []
})
export class AppRoutingModule { }
