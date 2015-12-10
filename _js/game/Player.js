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


    this.location = new Victor(this.x, this.y);
    this.velocity = new Victor(this.xSpeed, this.ySpeed);
    this.acceleration = new Victor(0, 0);
    this.mousepos = new Victor(this.x, this.y);

    //this.position = new Vector(position.x, position.y);

    //this.velocity = new Vector(0, 0);

   //$canvas.addEventListener('touchstart', this.touchStart, false);
   //$canvas.addEventListener('touchmove', this.setMousePosition.bind(this), false);

   //$canvas.addEventListener('mousedown', this.startDrag, false);
   //$canvas.addEventListener('mouseup', this.stopDrag, false);
   //$canvas.addEventListener('mousemove', this.setMousePosition.bind(this), false);


    $canvas.addEventListener('touchstart', this.testStart.bind(this), false);
    $canvas.addEventListener('touchmove', this.testMove.bind(this), false);

  }


  testStart(e) {
    console.log('test');
    this.getTouchPos();

    //drawDot(ctx,touchX,touchY,12);

    // Prevents an additional mousedown event being triggered
    e.preventDefault();
  }

  testMove(e) {
    console.log('moving');
    // Update the touch co-ordinates
    this.getTouchPos(e);

    // During a touchmove event, unlike a mousemove event, we don't need to check if the touch is engaged, since there will always be contact with the screen by definition.
    //drawDot(ctx,touchX,touchY,12);

    // Prevent a scrolling action as a result of this touchmove triggering.
    e.preventDefault();
  }

  getTouchPos(e) {

    console.log('test');

    console.log(e);
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


    //this.dir = this.mouse.clone();
    //this.dir.substract(this.location);

    //this.dir.normalize();
    //this.dir.multiply(0.5, 0,5);
    //this.acceleration = this.dir;

    this.velocity.add(this.acceleration);
    this.velocity.limit(this.topSpeed, 1);
    this.location.add(this.velocity);

    //console.log(this.location.toString());

    this.checkEdges();


    //this.velocity.add(this.acceleration);
    //this.position.add(this.velocity);

    //this.acceleration.mult(0);
    //this.velocity.mult(0.95);
    this.ctx.fillStyle = 'yellow';
    this.ctx.beginPath();
    this.ctx.arc(this.mousepos.x, this.mousepos.y, this.radius, 0, 2*Math.PI);

    this.ctx.fill();

  }

  checkEdges(){
    if ((this.location.x >= 320-this.radius) || (this.location.x <= this.radius)) {

      this.velocity.x = this.velocity.x * -1;
      this.acceleration.x = this.acceleration.x * -1;

      console.log('botsX');
    }
    if ((this.location.y >= 568 - this.radius) || (this.location.y <= this.radius)) {
      this.velocity.y = this.velocity.y * -1;
      this.acceleration.y = this.acceleration.y * -1;
      console.log('botsY');
    }

  }

  startDrag(e){

    e.preventDefault();
    console.log('down');

  }
  stopDrag(e){
    e.preventDefault();
    console.log('up');

  }

  setMousePosition(e){
    e.preventDefault();
    console.log(e);

    this.mousepos.x = e.clientX-e.target.offsetLeft;
    this.mousepos.y = e.clientY-e.target.offsetTop;
    console.log(this.mousepos);


  }

}

