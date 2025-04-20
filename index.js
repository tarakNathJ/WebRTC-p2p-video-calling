import {  WebSocketServer } from 'ws';
import express from 'express';
const app = express();
const server = app.listen(8080, () => {
  console.log("server start 8080 port")
});

const wss = new WebSocketServer({ server: server });

let senderSocket = null;
let receiverSocket = null;

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    const message = JSON.parse(data);
    if (message.type === 'sender') {
      senderSocket = ws;
    }
    else if (message.type === 'receiver') {
      receiverSocket = ws;
    }
    else if (message.type === 'createOffer') {
      if (ws === senderSocket) {
        receiverSocket?.send(JSON.stringify({ type: 'createOffer', sdp: message.sdp }));
      } else {
        senderSocket?.send(JSON.stringify({ type: 'createOffer', sdp: message.sdp }));
        
      }
    }
    else if (message.type === 'createAnswer') {
      if (ws === receiverSocket) {
        senderSocket?.send(JSON.stringify({ type: 'createAnswer', sdp: message.sdp }));
      }else{
        receiverSocket?.send(JSON.stringify({ type: 'createAnswer', sdp: message.sdp }));
      }
      
    }
    else if (message.type === 'iceCandidate') {
      if (ws === senderSocket) {
        receiverSocket?.send(JSON.stringify({ type: 'iceCandidate', candidate: message.candidate }));
      } else if (ws === receiverSocket) {
        senderSocket?.send(JSON.stringify({ type: 'iceCandidate', candidate: message.candidate }));
      }
    }
  });
});