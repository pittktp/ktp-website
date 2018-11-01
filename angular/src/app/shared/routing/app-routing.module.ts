import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from '../../login/login.component';
import { HomeComponent } from '../../home/home.component';
import { PointsComponent } from '../../points/points.component';
import { EditMembersComponent } from '../../edit-members/edit-members.component';
import { NavComponent } from '../../nav/nav.component';
import { AuthGuard } from '../auth/auth.guard';


const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'points', component: PointsComponent, canActivate: [AuthGuard] },
  { path: 'edit-members', component: EditMembersComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent},
  // otherwise redirect to home
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
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
