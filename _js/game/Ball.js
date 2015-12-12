'use strict';

//import {MathUtil, SoundUtil} from '../util/';

import EventEmitter from 'eventemitter2';



//Variabelen

let Victor = require('victor');


export default class Ball extends EventEmitter{


  constructor(x, y, active, socket){

    super(); //roept super van eventemitter op anders zal het niet werken

    this.socket = socket;
    this.x = x;
    this.y = y;
    this.xSpeed = 0;
    this.ySpeed = 0;
    this.radius = 15;
    this.fill = 'black';
    //this.topSpeed = 20;
    this.mass = 10;

    this.active = active;

    this.ctx=document.querySelector('#canvas').getContext('2d');
    this.location = new Victor(this.x, this.y);
    this.velocity = new Victor(this.xSpeed, this.ySpeed);
    this.acceleration = new Victor(0, 0);

    this.friction = new Victor(0.99, 0.99);



  }

  update(){


    this.velocity.add(this.acceleration);

    //console.log(this.velocity);




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

    this.velocity.multiply(this.friction);

  }
  setVelocity(x, y){

    this.velocity.x = x;
    this.velocity.y = y;
  }

  setAcceleration(x, y){

    this.acceleration.x = x;
    this.acceleration.y = y;
  }

  checkEdges(){






    if (this.location.y >= 492 - this.radius) {

      if(this.location.x > 80 && this.location.x < 320-80){
        //binnen in goal
        if(!this.active)return;

        if(this.location.y >= 495) {
          console.log('goal');
          this.socket.emit('goal', this.socket.id, this.socket.opponent);
          this.active = false;
        }



      }else{
        //naast goal tegen onderkant
        this.velocity.y = this.velocity.y * -1;
        this.acceleration.y = this.acceleration.y * -1;
        console.log('botsY');
        this.location.y = 492-this.radius;
      }




    }else if (this.location.y <= this.radius & this.velocity.y < 0){
      //bovenaan scherm, pass ball
      if(this.active){

        let data = {
          location: this.location,
          velocity: this.velocity,
          acceleration: this.acceleration,
          from: this.socket.id,
          to: this.socket.opponent
        };
        this.socket.emit('passBall', data);

        this.active = false;
      }else{
        if (this.location.y <= -this.radius & this.velocity.y < 0){
          this.socket.emit('hideBall', this.socket.id);
        }


      }




    }
    //zijkanten
    if ((this.location.x >= 320-this.radius) || (this.location.x <= this.radius)) {

      this.velocity.x = this.velocity.x * -1;
      this.acceleration.x = this.acceleration.x * -1;

      if(this.location.x > 320-this.radius) this.location.x = 320-this.radius;
      if(this.location.x < this.radius) this.location.x = this.radius;

    }



  }



}

