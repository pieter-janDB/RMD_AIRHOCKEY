'use strict';

// some features need the be polyfilled..
// https://babeljs.io/docs/usage/polyfill/

// import 'babel-core/polyfill';
// or import specific polyfills
// import {$} from './helpers/util';


import {Ball, Player} from './game/';

import {$, html} from './helpers/util.js';
import userTpl from '../_hbs/user';
import Status from '../models/Status.js';


let player, ball;

let socket;
let $clientsList = $('.clients');
let socketId;
let ballOnScreen;

let $canvas = document.querySelector('#canvas');
let ctx = $canvas.getContext('2d');

const init = () => {

    //SOCKET.IO
  initSocket();




  //setupGame();
};

const initSocket = () => {
  socket = io('http://localhost:3000');

  socket.on('init', clients => {

    if($clientsList){

      $clientsList.innerHtml = '';

      clients.forEach(client => {

        if(client.socketId === socket.id){
          client.self = true;

        }

        let $client = html(userTpl(client));

        if(client.socketId !== socketId){

          $client.querySelector('.connect').addEventListener('click', e => {
            e.preventDefault();

            matchPlayers(e);

          });

        }
        if(client.self === true){

          $client.setAttribute('class', 'self');
          let firstChild = $clientsList.firstChild;
          if(firstChild){
            $clientsList.insertBefore($client, firstChild);
          }else{

            $clientsList.appendChild($client);
          }

        }else{
          $client.setAttribute('class', 'other');
          $clientsList.appendChild($client);

        }
      });
    }
  });

   //als je zelf joint
  socket.on('join', client => {

    let $el = html(userTpl(client));
    $clientsList.appendChild($el);
  });

  //stel eigen id in als socketId
  socket.on('id', id => {

    socketId = id;
  });

  //als er iemand disconnect
  socket.on('leave', socketIdToRemove => {

    if(socket.opponent === ''){
      let $el = $(`[data-socketId='${socketIdToRemove}']`); //``backtabs
      $el.parentNode.removeChild($el);
    }
  });

  //als er op jouw naam geklikt is
  socket.on('gameInvite', senderid => {

    socket.opponent = senderid;
    socket.playerNumber = 2;
    socket.status = Status.paired;
    hideList();
  });

  //stuur terug of jij ready bent of niet
  socket.on('requestStatus', senderid => {

    console.log('status has been requested');

    socket.emit('sendStatus', {
      status: socket.status,
      to: senderid
    });

  });

  // als de andere ook rdy is start game
  socket.on('sendStatus', status => {

    if(socket.status === status){
      socket.emit('startGame', socket.opponent);
      setupGame();

    }
  });
  // iedereen is rdy
  socket.on('readyToStart', () => {

    setupGame();
  });


};


const matchPlayers = (e) => {
  socket.emit('gameInvite', {
    from: socketId,
    to: e.currentTarget.parentNode.getAttribute('data-socketid')
  });

  socket.opponent = e.currentTarget.parentNode.getAttribute('data-socketid');
  socket.playerNumber = 1;
  socket.status = Status.paired;
  hideList();

};

const hideList = () => {

  socket.emit('leaveList', socketId);
  $clientsList.parentNode.removeChild($clientsList);
  showStartScreen();

};

const showStartScreen = () => {

  ctx.fillStyle = '#E4EEF9';
  ctx.rect(0, 0, 320, 568);
  ctx.fill();

  ctx.fillStyle = 'red';
  ctx.font='120px Georgia';
  ctx.fillText(socket.playerNumber, 130, 200);

  let boxX = 60;
  let boxY = 400;
  let boxWidth = 200;
  let boxHeight = 100;

  ctx.rect(boxX, boxY, boxWidth, boxHeight);
  ctx.stroke();

  ctx.font='50px Georgia';
  ctx.fillText('ready', 100, 480);

  $canvas.addEventListener('touchstart', setReady, false);

};

const setReady = e => {

  let boxX = 60;
  let boxY = 400;
  let boxWidth = 200;
  let boxHeight = 100;

  e.preventDefault();

  if(e.touches['0'].clientX > boxX && e.touches['0'].clientX < boxX + boxWidth && e.touches['0'].clientY > boxY && e.touches['0'].clientY < boxY + boxHeight){
    ctx.fillStyle = '#E4EEF9';
    ctx.rect(0, 0, 320, 568);
    ctx.fill();

    ctx.fillStyle = 'green';
    ctx.font='120px Georgia';
    ctx.fillText(socket.playerNumber, 130, 200);


    ctx.rect(60, 400, 200, 100);
    ctx.stroke();

    ctx.font='50px Georgia';
    ctx.fillText('ready', 100, 480);
    socket.status = Status.ready;

    socket.emit('requestStatus', {
      from: socketId,
      to: socket.opponent
    });

  }
};

const setupGame = () => {

  $canvas.removeEventListener('touchstart', setReady, false);

  //load graphics

  //if ready => start Game loop
  //gebeurd in socket.on('sendStatus'...

  player = new Player();
  if(socket.playerNumber === 1){
    ball = new Ball(160.0, 425.0);
    ballOnScreen = true;
  }else{
    ball = new Ball(-40, -40);
    ballOnScreen = false;
  }
  _onFrame();
};



const _onFrame = () => {


  //draw background
  ctx.fillStyle = '#E4EEF9';
  ctx.rect(0, 0, 320, 568);
  ctx.fill();


  player.update();



  //console.log(player.location);
  //console.log(ball.location);



  if(ballOnScreen){
    ball.update();
  }


  requestAnimationFrame(() => _onFrame()); //lus om te blijven uitvoeren voor animatie

};





init();
