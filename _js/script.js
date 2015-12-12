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
let ownScore = 0;
let strangerScore = 0;
let scoreScreenImg, scoreScreenReadyImg;
let startsWithBall = false;

let $canvas = document.querySelector('#canvas');
let ctx = $canvas.getContext('2d');

const init = () => {

    //SOCKET.IO
  initSocket();




  //setupGame();
};

const initSocket = () => {

  //socket = io.connect('http://localhost:3000');
  socket = io();

  socket.on('init', clients => {

    if($clientsList){

      $clientsList.innerHtml = '';

      clients.forEach(client => {

        if(client.socketId === socket.id){
          client.self = true;

        }

        let $client = html(userTpl(client));

        if(client.socketId !== socketId){

          $client.querySelector('.connect').addEventListener('touchstart', e => {
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

   //als er iem joint
  socket.on('join', client => {

    let $el = html(userTpl(client));
    $el.setAttribute('class', 'other');
    $el.querySelector('.connect').addEventListener('click', e => {
      e.preventDefault();

      matchPlayers(e);

    });

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
      socket.status = Status.playing;
      setupGame();

    }
  });
  // iedereen is rdy
  socket.on('readyToStart', () => {
    socket.status = Status.playing;
    setupGame();
  });

  socket.on('sendingBallData', data => {
    spawnBall(data);
  });

  socket.on('hideBall', () => {
    ballOnScreen = false;
  });

  socket.on('tegengoal', () => {
    strangerScore++;
    socket.status = Status.scoreScreen;
    startsWithBall = true;
  });

  socket.on('gescoord', () => {
    console.log('joepie goal');
    ownScore++;
    socket.status = Status.scoreScreen;
    startsWithBall = false;
  });


};


const matchPlayers = (e) => {
  socket.emit('gameInvite', {
    from: socketId,
    to: e.currentTarget.parentNode.getAttribute('data-socketid')
  });

  socket.opponent = e.currentTarget.parentNode.getAttribute('data-socketid');
  socket.playerNumber = 1;
  startsWithBall = true;
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
  let boxY = 270;
  let boxWidth = 200;
  let boxHeight = 80;

  ctx.rect(boxX, boxY, boxWidth, boxHeight);
  ctx.stroke();

  ctx.font='50px Georgia';
  ctx.fillText('ready', 100, boxY + boxHeight - 30);

  $canvas.addEventListener('touchstart', setReady, false);

};

const setReady = e => {


  let boxX = 60;
  let boxY = 270;
  let boxWidth = 200;
  let boxHeight = 80;

  e.preventDefault();

  if(e.touches['0'].clientX > boxX && e.touches['0'].clientX < boxX + boxWidth && e.touches['0'].clientY > boxY && e.touches['0'].clientY < boxY + boxHeight){
    if(socket.status === Status.paired){
      ctx.fillStyle = '#E4EEF9';
      ctx.rect(0, 0, 320, 568);
      ctx.fill();

      ctx.fillStyle = 'green';
      ctx.font='120px Georgia';
      ctx.fillText(socket.playerNumber, 130, 200);


      ctx.rect(boxX, boxY, boxWidth, boxHeight);
      ctx.stroke();

      ctx.font='50px Georgia';
      ctx.fillText('ready', 100, boxY + boxHeight - 30);
      socket.status = Status.ready;
    }else if(socket.status === Status.scoreScreenImg){
      socket.status = Status.ready;

    }


    socket.emit('requestStatus', {
      from: socketId,
      to: socket.opponent
    });

  }
};

const setupGame = () => {

  $canvas.removeEventListener('touchstart', setReady, false);

    //load graphics
  scoreScreenImg = new Image();   // Create new img element
  scoreScreenReadyImg = new Image();

  scoreScreenReadyImg.src = './data/scoreRdy.png';
  scoreScreenImg.src = './data/scoreNotRdy.png';

  //if ready => start Game loop
  //gebeurd in socket.on('sendStatus'... (als alle2 ready zijn)

  player = new Player();
  if(startsWithBall){
    ball = new Ball(160.0, 300.0, true, socket);
    ballOnScreen = true;
  }else{
    ball = new Ball(0, 0, false, socket);
    ballOnScreen = false;
  }
  _onFrame();
};



const _onFrame = () => {

  if(socket.status === Status.playing){
    //draw background
    ctx.fillStyle = '#E4EEF9';
    ctx.rect(0, 0, 320, 568);
    ctx.fill();

    //draw goal

    ctx.fillStyle = '#00B3CC';
    player.update();


    if(ballOnScreen){
      if(checkCollision()){

fixOverlapping();

      }
       ball.update();
      if(checkCollision()){
        manageBounce();
      }
    }
  }else{





  // execute drawImage statements here
    if(socket.status === Status.scoreScreen){
      ctx.drawImage(scoreScreenImg, 0, 0);
      $canvas.addEventListener('touchstart', setReady, false);
    }else{
      ctx.drawImage(scoreScreenReadyImg, 0, 0);
    }


    ctx.fillStyle = 'red';
    ctx.font='60px Georgia';
    ctx.fillText(ownScore, 100, 150);


    ctx.font='60px Georgia';
    ctx.fillText(strangerScore, 210, 150);



  }







  requestAnimationFrame(() => _onFrame()); //lus om te blijven uitvoeren voor animatie

};

const spawnBall = data => {
  ballOnScreen = true;

  ball = new Ball(320 - data.location.x, data.location.y - ball.radius*2, true, socket);

  ball.setVelocity(-data.velocity.x, -data.velocity.y);
  ball.setAcceleration(-data.acceleration.x, -data.acceleration.y);
};

const checkCollision = () => {
  //check collision if true bereken de bounce

  let distance = Math.sqrt(Math.pow(ball.location.x - player.location.x, 2) + Math.pow(ball.location.y - player.location.y, 2));
  if (distance <= player.radius + ball.radius){
    return true;

  }else{
    return false;
  }


};

const fixOverlapping = () => {

  let midpointx = (player.location.x + ball.location.x) / 2;
  let midpointy = (player.location.y + ball.location.y) / 2;

  let dist = Math.sqrt(Math.pow(ball.location.x - player.location.x, 2) + Math.pow(ball.location.y - player.location.y, 2));

  ball.location.x = midpointx + ((player.radius +ball.radius )/2) * (ball.location.x - player.location.x) / dist;
  ball.location.y = midpointy + ((player.radius +ball.radius )/2) * (ball.location.y - player.location.y) / dist;

};

const manageBounce = () => {
  let dx = player.location.x-ball.location.x;
  let dy = player.location.y-ball.location.y;
  let collisionisionAngle = Math.atan2(dy, dx);
  let magnitude1 = Math.sqrt(player.velocity.x*player.velocity.x+player.velocity.y*player.velocity.y);
  let magnitude2 = Math.sqrt(ball.velocity.x*ball.velocity.x+ball.velocity.y*ball.velocity.y);
  let direction1 = Math.atan2(player.velocity.y, player.velocity.x);
  let direction2 = Math.atan2(ball.velocity.y, ball.velocity.x);
  let newVelocityX1 = magnitude1*Math.cos(direction1-collisionisionAngle);
  //let newVelocityY1 = magnitude1*Math.sin(direction1-collisionisionAngle);
  let newVelocityX2 = magnitude2*Math.cos(direction2-collisionisionAngle);
  let newVelocityY2 = magnitude2*Math.sin(direction2-collisionisionAngle);
  //let finalVelocityX1 = ((player.mass-ball.mass)*newVelocityX1+(ball.mass+ball.mass)*newVelocityX2)/(player.mass+ball.mass);
  let finalVelocityX2 = ((player.mass+player.mass)*newVelocityX1+(ball.mass-player.mass)*newVelocityX2)/(player.mass+ball.mass);
  //let finalVelocityY1 = newVelocityY1;
  let finalVelocityY2 = newVelocityY2;
  //player.velocity.x = Math.cos(collisionisionAngle)*finalVelocityX1+Math.cos(collisionisionAngle+Math.PI/2)*finalVelocityY1;
  //player.velocity.y = Math.sin(collisionisionAngle)*finalVelocityX1+Math.sin(collisionisionAngle+Math.PI/2)*finalVelocityY1;
  ball.velocity.x = Math.cos(collisionisionAngle)*finalVelocityX2+Math.cos(collisionisionAngle+Math.PI/2)*finalVelocityY2;
  ball.velocity.y = Math.sin(collisionisionAngle)*finalVelocityX2+Math.sin(collisionisionAngle+Math.PI/2)*finalVelocityY2;
};



init();
