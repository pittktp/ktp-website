import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from '../../login/login.component';
import { HomeComponent } from '../../home/home.component';
import { PointsComponent } from '../../points/points.component';
import { EditMembersComponent } from '../../edit-members/edit-members.component';
import { ProfileComponent } from '../../profile/profile.component';
import { NavComponent } from '../../nav/nav.component';
import { AuthGuard } from '../auth/auth.guard';
import { MembersComponent } from '../../members/members.component';


const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'points', component: PointsComponent, },
  { path: 'edit-members', component: EditMembersComponent,  },
  { path: 'members', component: MembersComponent,  },
  { path: 'login', component: LoginComponent},
  { path: 'profile/:id', component: ProfileComponent, runGuardsAndResolvers: 'always' },
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
