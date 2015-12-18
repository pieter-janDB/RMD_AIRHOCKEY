'use strict';
import SoundUtil from '../util/SoundUtil';
import {mapRange} from '../helpers/util.js';

export default class AudioPlayer {

  constructor(ctx){

    this.ctx = ctx;
    this.bounds = {
      width: 320,
      height: 492,
      border: 0
    };
    this.volume = 0;
  }

  playSound(buffer){

    let source = this.ctx.createBufferSource(); // Declare a New Sound
    source.buffer = buffer; // Attatch our Audio Data as it's Buffer
    source.connect(this.ctx.destination);  // Link the Sound to the Output
    source.start(0); // Play the Sound Immediately
  }

  play(ball, player, collisionWith){

    let source = this.ctx.createOscillator();
    source.type = 'triangle';

    if(collisionWith === 'wall'){
      source.frequency.value = 250 + ball.location.y / 2;
      this.volume = mapRange((Math.abs(ball.velocity.x) + Math.abs(ball.velocity.y)/2), 0, ball.topSpeed, 0.3, 1);

    }else if(collisionWith === 'paddle'){
      source.frequency.value = 100 + (Math.abs(ball.velocity.x) + Math.abs(ball.velocity.y) + Math.abs(player.velocity.x) + Math.abs(player.velocity.y)) * 4;
      this.volume = mapRange((Math.abs(player.velocity.x) + Math.abs(player.velocity.y)/2), 0, player.topSpeed, 0.3, 1);

    }
    let panner = this.ctx.createPanner();
    panner.panningModel = 'equalpower';

    let panning = SoundUtil.getPanning(this.bounds, ball.location.x);
    panner.setPosition(panning, 0, 1 - Math.abs(panning));

    let gain = this.ctx.createGain();
    gain.gain.value = this.volume;

    source.connect(panner);
    panner.connect(gain);
    gain.connect(this.ctx.destination);

    source.start(0);
    source.stop(this.ctx.currentTime + 0.2);
  }
}
