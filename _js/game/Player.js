'use strict';

//import {MathUtil, SoundUtil} from '../util/';

import EventEmitter from 'eventemitter2';



//Variabelen


let $canvas=document.querySelector('#canvas');
let Victor = require('victor');


export default class Player extends EventEmitter{


  constructor(){

    super(); //roept super van eventemitter op anders zal het niet werken


    this.x = 160.0;
    this.y = 475.0;
    this.xSpeed = 0;
    this.ySpeed = 0;
    this.radius = 30;
    this.fill = 'red';
    this.topSpeed = 100;
    this.ctx = $canvas.getContext('2d');
    this.playFieldWidth = 320;
    this.playFieldHeight = 568;
    this.mass = 500;


    this.location = new Victor(this.x, this.y);
    this.easing = new Victor(0.4, 0.4);
    this.mousepos = new Victor(this.x, this.y);
    //this.acceleration = new Victor(0, 0);

    this.velocity = new Victor(this.xSpeed, this.ySpeed);

    $canvas.addEventListener('touchstart', this.testStart.bind(this), false);
    $canvas.addEventListener('touchmove', this.testMove.bind(this), false);

  }


  testStart(e) {
    this.getTouchPos();

    //drawDot(ctx,touchX,touchY,12);

    // Prevents an additional mousedown event being triggered
    e.preventDefault();
  }

  testMove(e) {
    // Update the touch co-ordinates
    this.getTouchPos(e);

    // During a touchmove event, unlike a mousemove event, we don't need to check if the touch is engaged, since there will always be contact with the screen by definition.
    //drawDot(ctx,touchX,touchY,12);

    // Prevent a scrolling action as a result of this touchmove triggering.
    e.preventDefault();
  }

  getTouchPos(e) {

    if (!e){
      var e = event;
    }
    if (e.touches) {
      if (e.touches.length === 1) { // Only deal with one finger
        var touch = e.touches[0]; // Get the information for finger #1
        this.mousepos.x=touch.pageX-touch.target.offsetLeft;
        this.mousepos.y=touch.pageY-touch.target.offsetTop;
      }
    }
  }



  update(){


    //console.log(this.mousepos);



    //this.dir.substract(this.location);


    this.velocity = this.mousepos.clone().subtract(this.location).multiply(this.easing);
    this.location = this.location.add(this.velocity);

    //zie dat player in scherm blijft
    if(this.location.x < this.radius) this.location.x = this.radius;
    if(this.location.x > this.playFieldWidth - this.radius) this.location.x = this.playFieldWidth - this.radius;
    if(this.location.y < this.radius) this.location.y = this.radius;
    if(this.location.y > this.playFieldHeight - this.radius) this.location.y = this.playFieldHeight - this.radius;


    //this.dir.normalize();
    //this.dir.multiply(0.5, 0,5);
    //this.acceleration = this.dir;
    //this.acceleration = dir;
    //this.velocity.add(this.acceleration);
    //this.velocity.limit(this.topSpeed, 0.99);
    //this.location.add(this.velocity);

    //console.log(this.location.toString());

    //this.checkEdges();


    //this.velocity.add(this.acceleration);
    //this.location.add(this.velocity);

    //this.acceleration.mult(0);
    //this.velocity.mult(0.95);
    this.ctx.fillStyle = '#00B3CC';
    this.ctx.beginPath();
    this.ctx.arc(this.location.x, this.location.y, this.radius, 0, 2*Math.PI);

    this.ctx.fill();

  }

  checkEdges(){
    if ((this.location.x >= this.playFieldWidth-this.radius) || (this.location.x <= this.radius)) {

      this.velocity.x = this.velocity.x * -1;
      this.acceleration.x = this.acceleration.x * -1;

      console.log('botsX');
    }
    if ((this.location.y >= this.playFieldHeight - this.radius) || (this.location.y <= this.radius)) {
      this.velocity.y = this.velocity.y * -1;
      this.acceleration.y = this.acceleration.y * -1;
      console.log('botsY');
    }

  }



}

