'use strict';

//import {MathUtil, SoundUtil} from '../util/';

import EventEmitter from 'eventemitter2';



//Variabelen


let $canvas=document.querySelector('#canvas');
let Victor = require('victor');


export default class Player extends EventEmitter{


  constructor(paddleImg){

    super(); //roept super van eventemitter op anders zal het niet werken
    this.radius = 40;
    this.topSpeed = 19;
    this.ctx = $canvas.getContext('2d');
    this.playFieldWidth = 320;
    this.playFieldHeight = 492;
    this.mass = 75;

    this.paddleImg = paddleImg;

    this.location = new Victor(160.0, 375.0);
    this.easing = new Victor(1, 1);
    this.mousepos = new Victor(160.0, 375.0);
    this.velocity = new Victor(0, 0);
    this.oldVelocity = 0;

    $canvas.addEventListener('touchstart', this.touchStart.bind(this), false);
    $canvas.addEventListener('touchmove', this.touchMov.bind(this), false);

  }


  touchStart(e) {
    this.getTouchPos();
    e.preventDefault();
  }

  touchMov(e) {
    this.getTouchPos(e);
    e.preventDefault();
  }

  getTouchPos(e) {

    if (!e){
      var e = event;
    }
    if (e.touches) {
      if (e.touches.length === 1) { // Only deal with one finger
        var touch = e.touches[0]; // Get the information for finger #1
        //enkel als vinger < 100px van bal verwijderd is
        if(touch.pageX-touch.target.offsetLeft >= this.mousepos.x -100 && touch.pageX-touch.target.offsetLeft <= this.mousepos.x +100 && touch.pageY-touch.target.offsetLeft >= this.mousepos.y -100 && touch.pageY-touch.target.offsetLeft <= this.mousepos.y +100){

          this.mousepos.x=touch.pageX-touch.target.offsetLeft;
          this.mousepos.y=touch.pageY-touch.target.offsetTop;
          if(this.mousepos.x < this.radius) this.mousepos.x = this.radius;
          if(this.mousepos.x > this.playFieldWidth - this.radius) this.mousepos.x = this.playFieldWidth - this.radius;
          if(this.mousepos.y < this.radius) this.mousepos.y = this.radius;
          if(this.mousepos.y > this.playFieldHeight - this.radius) this.mousepos.y = this.playFieldHeight - this.radius;
        }
      }
    }
  }

  update(){



    this.velocity = this.mousepos.clone().subtract(this.location).multiply(this.easing);
    this.limitSpeed(this.topSpeed);
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


  }

  draw(){

    this.ctx.drawImage(this.paddleImg, this.location.x-this.radius, this.location.y-this.radius, this.radius*2, this.radius*2);

    /*this.ctx.fillStyle = '#00B3CC';
    this.ctx.beginPath();
    this.ctx.arc(this.location.x, this.location.y, this.radius, 0, 2*Math.PI);
    this.ctx.fill();*/
  }

  limitSpeed(limit){



    if(this.velocity.x > limit){
      this.oldVelocity = this.velocity.x;
      this.velocity.x = limit;
      if(this.velocity.y < 0){
        this.velocity.y = this.velocity.y / this.oldVelocity * limit;
      }else{
        this.velocity.y = this.velocity.y / this.oldVelocity * limit;
      }

    }else if(this.velocity.x < -limit){
      this.oldVelocity = this.velocity.x;
      this.velocity.x = -limit;
      if(this.velocity.y < 0){
        this.velocity.y = this.velocity.y / this.oldVelocity * -limit;
      }else{
        this.velocity.y = this.velocity.y / this.oldVelocity * -limit;
      }

    }
    if(this.velocity.y > limit){
      this.oldVelocity = this.velocity.y;
      this.velocity.y = limit;
      if(this.velocity.x < 0){
        this.velocity.x = this.velocity.x / this.oldVelocity * limit;
      }else{
        this.velocity.x = this.velocity.x / this.oldVelocity * limit;
      }

    }else if(this.velocity.y < -limit){
      this.oldVelocity = this.velocity.y;
      this.velocity.y = -limit;
      // velo x -10 en y -3 of 3
      if(this.velocity.x < 0){
        this.velocity.x = this.velocity.x / this.oldVelocity * -limit;
      }else{
        this.velocity.x = this.velocity.x / this.oldVelocity * -limit;
      }

    }

  }




}

