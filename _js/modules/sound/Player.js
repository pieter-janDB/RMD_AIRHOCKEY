'use strict';

export default class Player {

  constructor(ctx){

    this.ctx = ctx;

  }

  play(hit){

    let source;

    source = this.ctx.createBufferSource();
    source.buffer = fixed.sample;

    let panner = this.ctx.createPanner();
    panner.panningModel = 'equalpower';
    panner.setPosition(fixed.panning, 0, 1 - Math.abs(fixed.panning));

    let gain = this.ctx.createGain();
    gain.gain.value = fixed.volume;

    source.connect(panner);
    panner.connect(gain);

    gain.connect(this.ctx.destination);

    source.start();
    source.stop(this.ctx.currentTime + 0.3);

  }

}
