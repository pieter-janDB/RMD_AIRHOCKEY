'use strict';

export default class BufferLoader {

  constructor(ctx){
    this.ctx = ctx;
  }

  decode(buffer){

    return new Promise((resolve, reject) => {
      this.ctx.decodeAudioData(buffer, data => {
        if(!data) return reject(new Error('error while decoding'));
        return resolve(data);
      });
    });

  }

  loadBuffer(url) {

    return fetch(url)
      .then(r => r.arrayBuffer())
      .then(buffer => this.decode(buffer));

  }

  load(list) {

    this.list = list;

    return new Promise((resolve, reject) => {

      let _arr = [];

      this.list.forEach(item => {
        _arr.push(this.loadBuffer(item.file, item.name));
      });

      Promise.all(_arr)
        .then(arr => resolve(arr))
        .catch(err => reject(err));

    });

  }

}
