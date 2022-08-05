import { Middleware } from "@reduxjs/toolkit";
import WebSocket from 'ws';
import { chatActions } from "../slices/chat";

const chatMiddleware: Middleware = (store) => (next) => (action) => {
  if (!chatActions.startConnecting.match(action)) {
    return next(action);
  }

  const socket = new WebSocket("ws://127.0.0.1:4000?server=195.201.123.169:16000&username=jake");

  socket.on('connect', () => {
    console.log('Connected to WebSocket!');
    store.dispatch(chatActions.connectionEstablished());
  });

  socket.on('message', (message: any) => {
    store.dispatch(chatActions.recieveMessage({ message }))
  });

  next(action);
};

export default chatMiddleware;
