'use strict';
import SoundUtil from '../util/SoundUtil';
import {mapRange} from '../../helpers/util.js';

export default class AudioPlayer {

  constructor(ctx){

    this.ctx = ctx;
    this.bounds = {
      width: 320,
      height: 492,
      border: 0
    };

  }
  playSound(buffer){

      /*let source = this.ctx.createOscillator();
      source.frequency.value = 200;



      source.connect(this.ctx.destination);
      source.start(0);
      source.stop(this.ctx.currentTime + 0.2);



      source = this.ctx.createBufferSource();
      source.buffer = fixed.sample;
  */

      ///


        let source = this.ctx.createBufferSource(); // Declare a New Sound
        source.buffer = buffer; // Attatch our Audio Data as it's Buffer
        source.connect(this.ctx.destination);  // Link the Sound to the Output
        source.start(0); // Play the Sound Immediately
        //source.stop(this.ctx.currentTime + 0.87);






  }

  play(ball){

    let source = this.ctx.createOscillator();
    source.type = 'triangle';
    source.frequency.value = 300 + ball.location.y / 3 + (Math.abs(ball.velocity.x) + Math.abs(ball.velocity.y)/2);

    let panner = this.ctx.createPanner();
    panner.panningModel = 'equalpower';

    let panning = SoundUtil.getPanning(this.bounds, ball.location.x);
    panner.setPosition(panning, 0, 1 - Math.abs(panning));

    let realVolume = mapRange((Math.abs(ball.velocity.x) + Math.abs(ball.velocity.y)/2), 0, ball.topSpeed, 0.3, 1);

    let gain = this.ctx.createGain();
    gain.gain.value = realVolume;


    source.connect(panner);
    panner.connect(gain);

    gain.connect(this.ctx.destination);


    //source.connect(this.ctx.destination);


    source.start(0);
    source.stop(this.ctx.currentTime + 0.2);
  }

}
