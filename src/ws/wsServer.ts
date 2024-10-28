import { WS_PORT } from 'src/constants/constants';
import { WsEvent } from 'src/model/types';
import { WebSocketServer } from 'ws';
import { eventHandler } from './eventHandler';
import { parseMessage } from 'src/utils/parseMessage';

export const wss = new WebSocketServer({ port: WS_PORT });

wss.on('connection', (ws, req) => {
  console.log('Websocket connection succesfully established.');

  ws.on('message', (rawMessage) => {
    let msg = parseMessage(rawMessage.toString()) as WsEvent;
    console.log('<--', 'Recieved from client', msg);
    eventHandler(ws, msg);
  });
});

wss.on('close', function close() {
  console.log('close');
});

process.on('SIGINT', () => {
  wss.close();
});
