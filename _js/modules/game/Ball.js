'use strict';

import EventEmitter from 'eventemitter2';
let Victor = require('victor');

export default class Ball extends EventEmitter{

  constructor(x, y, active, socket, puckImg){

    super(); //roept super van eventemitter op anders zal het niet werken
    this.socket = socket;
    this.radius = 20;
    this.topSpeed = 19;
    this.mass = 38;
    this.active = active;
    this.puckImg = puckImg;
    this.ctx=document.querySelector('#canvas').getContext('2d');
    this.location = new Victor(x, y);
    this.velocity = new Victor(0, 0);
    this.friction = new Victor(0.990, 0.990);
    this.oldVelocity = 0;
    this.playFieldWidth = 320;
    this.playFieldHeight = 492;
  }

  update(){

    this.limitSpeed(this.topSpeed);
    this.location.add(this.velocity);
    this.checkEdges();
  }

  draw(){

    this.ctx.drawImage(this.puckImg, this.location.x-this.radius, this.location.y-this.radius, this.radius*2, this.radius*2);
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
      if(this.velocity.x < 0){
        this.velocity.x = this.velocity.x / this.oldVelocity * -limit;
      }else{
        this.velocity.x = this.velocity.x / this.oldVelocity * -limit;
      }
    }
  }

  checkEdges(){

    if (this.location.y >= this.playFieldHeight - this.radius) {
      if(this.location.x > 58 && this.location.x < this.playFieldWidth-58){
        //binnen in goal
        if(!this.active)return;
        if(this.location.y >= 495) {
          this.socket.emit('goal', this.socket.id, this.socket.opponent);
          this.active = false;
        }
      }else{
        //naast goal tegen onderkant
        if(!this.active)return;
        this.velocity.y = this.velocity.y * -1;
        this.location.y = this.playFieldHeight-this.radius;
      }
    }else if (this.location.y <= this.radius && this.velocity.y < 0){
      //bovenaan scherm, pass ball
      if(this.active){
        let data = {
          location: this.location,
          velocity: this.velocity,
          from: this.socket.id,
          to: this.socket.opponent
        };
        this.socket.emit('passBall', data);
        this.active = false;
      }else{
        if (this.location.y <= -this.radius && this.velocity.y < 0){
          this.socket.emit('hideBall', this.socket.id);
        }
      }
    }
    //zijkanten
    if ((this.location.x >= this.playFieldWidth-this.radius) || (this.location.x <= this.radius)) {
      this.velocity.x = this.velocity.x * -1;
      if(this.location.x > this.playFieldWidth-this.radius) this.location.x = this.playFieldWidth-this.radius;
      if(this.location.x < this.radius) this.location.x = this.radius;
    }
  }

  overTheEdge(){
    //zijkanten
    if ((this.location.x >= this.playFieldWidth-this.radius) || (this.location.x <= this.radius) || this.location.y >= this.playFieldHeight - this.radius) {
      if(this.location.y >= this.playFieldHeight-this.radius){
        if(this.location.x > 58 && this.location.x < this.playFieldWidth-58){
          return false;
        }
        return true;
      }
      return true;
    }else{
      return false;
    }
  }
}
