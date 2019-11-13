import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

 import { RushMember } from '../shared/models/rushMember.model'; // TODO

import '../../assets/js/new-age.min.js';


@Component({
  selector: 'app-rush-form',
  templateUrl: './rush-form.component.html',
  styleUrls: ['./rush-form.component.css']
})
export class RushFormComponent implements OnInit {

  constructor() {  }  //TODO

  validEmail = true;



  ngOnInit() {
  }

  onSubmit(form: NgForm) {

    var newRush: RushMember = new RushMember();

    newRush.name = form.value.name;
    newRush.email = form.value.email;
    newRush.year = form.value.year;
    newRush.major = form.value.major;
    newRush.ref = form.value.ref;



  }



}
