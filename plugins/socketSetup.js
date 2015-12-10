'use strict';
module.exports.register = (server, options, next) => {

  let io = require('socket.io')(server.listener);
  let Status = require('../models/Status');
  let Client = require('../models/Client');
  let clients = [];

  const search = (you, socket) => {

    if(you === undefined || you.status !== Status.searching) return;

    let list = clients.filter(
      c => c.socketId !== you.socketId && c.status === Status.searching
    );

    if(list.length === 0){
      setTimeout(search, 2000, you, socket);
    }else{

      let stranger = list[Math.round(Math.random() * (list.length-1))];

      you.status = Status.paired;
      stranger.status = Status.paired;

      io.emit('update_status', you);
      io.emit('update_status', stranger);

      //stuur naar laatste found en wie het is
      //socket.emit('found', stranger);
      let roomId = Math.round(Math.random()*100*Math.random() *255);
      console.log(roomId);
      io.to(stranger.socketId).emit('found', you, roomId);
      io.to(you.socketId).emit('found', stranger, roomId);
      //stuur naar degene die al in queue zat?

    }

  };

  io.on('connection', socket => {
    let newClient = Object.assign({}, Client);

    newClient.socketId = socket.id;

    newClient.nickname = 'user: ' + socket.id;


    clients.push(newClient);

    //DISCONNECT
    socket.on('disconnect', () => {
      clients = clients.filter(
        c => c.socketId !== socket.id
      );

      socket.broadcast.emit('leave', socket.id);
    });

    //set status
    /*
    socket.on('status', status =>{

      if(newClient.status === status) return;
      newClient.status = status;
      if(newClient.status === Status.searching){

        search(newClient, socket);
      }

      io.emit('update_status', newClient);
    });

    */

    socket.on('gameInvite', data => {

      console.log('gameInvite' + data);


    });

    socket.on('gameInvite', data => io.to(data.to).emit('gameInvite', data.from));

    socket.emit('id', socket.id);


    //let client = new Client(maxID + 1, socket.id);


    socket.emit('init', clients); // doorsturen en in script opvangen
    socket.broadcast.emit('join', newClient);
  });




  next();
};
module.exports.register.attributes = {
  name: 'socketConnect',
  version: '0.1.0'
};
