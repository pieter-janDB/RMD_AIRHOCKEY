'use strict';
import SoundUtil from '../util/SoundUtil';
import {mapRange} from '../../helpers/util.js';

export default class AudioPlayer {

  constructor(ctx){

    this.ctx = ctx;

  }
  playSound(){
    let source = this.ctx.createOscillator();
    source.frequency.value = 200;



    source.connect(this.ctx.destination);
    source.start(0);
    source.stop(this.ctx.currentTime + 0.2);

  }

  play(ball, player){

    let source = this.ctx.createOscillator();
    source.frequency.value = 300 + ball.location.y / 2.5;
    console.log(source.frequency.value);



    let panner = this.ctx.createPanner();
    panner.panningModel = 'equalpower';
    let bounds = {
      width: 320,
      height: 492,
      border: 0
    };
    let panning = SoundUtil.getPanning(bounds, ball.location.x);
    panner.setPosition(panning, 0, 1 - Math.abs(panning));

    let volume = SoundUtil.getVolume(bounds, ball.location.y);
    let realVolume = mapRange((Math.abs(ball.velocity.x) + Math.abs(ball.velocity.y)/2), 0, ball.topSpeed, 0.4, 1);

    console.log('premap' + (Math.abs(ball.velocity.x) + Math.abs(ball.velocity.y)/2));
    console.log(realVolume);


    let gain = this.ctx.createGain();
    gain.gain.value = realVolume;


    source.connect(panner);
    panner.connect(gain);

    gain.connect(this.ctx.destination);


    //source.connect(this.ctx.destination);


    source.start(0, 0.25);
    source.stop(this.ctx.currentTime + 0.2);
  }

}
