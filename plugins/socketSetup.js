'use strict';
module.exports.register = (server, options, next) => {

  let io = require('socket.io')(server.listener);
  let Client = require('../models/Client');
  let clients = [];
  let maxId = 1;

  io.on('connection', socket => {


    let newClient = Object.assign({}, Client);

    newClient.socketId = socket.id;

    newClient.nickname = 'user: ' + maxId;


    clients.push(newClient);

    //DISCONNECT
    socket.on('disconnect', () => {
      clients = clients.filter(
        c => c.socketId !== socket.id
      );

      socket.broadcast.emit('leave', socket.id);
    });

    socket.on('leaveList', socketIdToRemove => {

      clients = clients.filter(
        c => c.socketId !== socketIdToRemove
      );

      socket.broadcast.emit('leave', socketIdToRemove);
    });


    socket.on('gameInvite', data => {
      io.to(data.to).emit('gameInvite', data.from);

    });

    socket.emit('id', socket.id);

    socket.emit('init', clients); // doorsturen en in script opvangen

    socket.broadcast.emit('join', newClient);

    socket.on('requestStatus', data => {
      io.to(data.to).emit('requestStatus', data.from);

    });

    socket.on('sendStatus', data => {
      io.to(data.to).emit('sendStatus', data.status);

    });

    socket.on('startGame', opponent => {
      console.log(opponent);
      io.to(opponent).emit('readyToStart');

    });

    socket.on('passBall', data => {
      console.log('passing ball');
      io.to(data.to).emit('sendingBallData', data);


    });

    socket.on('hideBall', playerId => {
      io.to(playerId).emit('hideBall');

    });

    socket.on('goal', (playerId, opponentId) => {
      io.to(playerId).emit('tegengoal');
      io.to(opponentId).emit('gescoord');

    });

    maxId++;
  });


  //GAMELOGICA







  next();
};
module.exports.register.attributes = {
  name: 'socketConnect',
  version: '0.1.0'
};
