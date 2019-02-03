import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import * as $ from "jquery";

import '../../assets/js/new-age.min.js';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

// This component is what the user first sees when accessing the website -> anyone can see this (don't have to be logged in)
// The code for this component (the ts, html, and css was lifted directly from the static website we inherited)
export class HomeComponent implements OnInit {

  constructor(private router: Router) {
  }

  ngOnInit() {
      this.loadScript('../assets/js/new-age.js');
  }

  // A hacked up way to load the js script needed to perform the scrolling animations
  loadScript(src) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    document.getElementsByTagName("body")[0].appendChild(script);
    script.src = src;
  }

}
