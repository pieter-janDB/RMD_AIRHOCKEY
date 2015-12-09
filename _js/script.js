'use strict';

// some features need the be polyfilled..
// https://babeljs.io/docs/usage/polyfill/

// import 'babel-core/polyfill';
// or import specific polyfills
// import {$} from './helpers/util';

let $canvas = document.querySelector('#canvas');
import {Ball, Player} from './game/';

import {$, html, prepend} from './helpers/util.js';
import userTpl from '../_hbs/user';
import Status from '../models/Status.js';


let player = new Player();
let ball = new Ball();


let playersArr = [];
let socket;
let $clientsList = $('.clients');
let $matchMakingKnop = $('.searchButton');
let socketId;

let ctx=document.querySelector('#canvas').getContext("2d");

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

        if(client.socketId != socketId){

          $client.querySelector('.connect').addEventListener('click', e => {

            socket.emit('gameInvite', {
              from: socketId,
              to: "test12345"
            });
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

    let $el = $(`[data-socketId='${socketIdToRemove}']`); //``backtabs
    $el.parentNode.removeChild($el);

  });


/*
  socket.on('update_status', data => {

    let $statusEl = $(`[data-socketid=${data.socketId}] p`);

    $statusEl.innerText = data.status;

  });
*/
/*
  socket.on('found', (stranger, roomId) => {
    console.log('found an oponent named: ' + stranger.nickname);

    console.log(roomId);
    window.location = './game';

  });
*/
};



const setupGame = () => {


  _onFrame();
};

const _onFrame = () => {



  ctx.fillStyle = "blue";

  ctx.rect(0, 0, 320, 568);
  ctx.fill();

  ball.update();
  player.update();

  requestAnimationFrame(() => _onFrame()); //lus om te blijven uitvoeren voor animatie

};





init();
