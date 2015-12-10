'use strict';

//import {MathUtil, SoundUtil} from '../util/';

import EventEmitter from 'eventemitter2';



//Variabelen

let Victor = require('victor');


export default class Ball extends EventEmitter{


  constructor(x, y){

    super(); //roept super van eventemitter op anders zal het niet werken


    this.x = x;
    this.y = y;
    this.xSpeed = 0;
    this.ySpeed = 0;
    this.radius = 15;
    this.fill = 'black';
    this.topSpeed = 0.1;

    this.ctx=document.querySelector('#canvas').getContext('2d');
    this.location = new Victor(this.x, this.y);
    this.velocity = new Victor(this.xSpeed, this.ySpeed);
    this.acceleration = new Victor(0.01, 0.01);



  }

  update(){


    this.velocity.add(this.acceleration);
    this.velocity.limit(this.topSpeed, 1);
    this.location.add(this.velocity);

    this.checkEdges();


    //this.velocity.add(this.acceleration);
    //this.position.add(this.velocity);

    //this.acceleration.mult(0);
    //this.velocity.mult(0.95);


    this.ctx.fillStyle = 'black';
    this.ctx.beginPath();
    this.ctx.arc(this.location.x, this.location.y, this.radius, 0, 2*Math.PI);

    this.ctx.fill();


  }

  checkEdges(){
    if ((this.location.x >= 320-this.radius) || (this.location.x <= this.radius)) {
      this.velocity.x = this.velocity.x * -1;
      this.acceleration.x = this.acceleration.x * -1;

      console.log('botsX');
    }
    if (this.location.y >= 568 - this.radius) {
      this.velocity.y = this.velocity.y * -1;
      this.acceleration.y = this.acceleration.y * -1;
      console.log('botsY');
    }else if (this.location.y <= this.radius){

      console.log('next screen');
      if(this.location.y <= -this.radius){
        console.log('out of bounds');
      }

    }

  }


}

