import { WS_PORT } from 'src/constants/constants';
import { WsEvent } from 'src/model/types';
import { generateId } from 'src/utils/generateId';
import { WebSocketServer } from 'ws';
import { eventHandler } from './handler';

export const wss = new WebSocketServer({ port: WS_PORT });

wss.on('connection', (ws, req) => {
  console.log('Websocket connection succesfully established.');
console.log(generateId())
  ws.on('message', (rawMessage) => {
    let msg=JSON.parse(rawMessage.toString()) as WsEvent
    console.log(msg);
    eventHandler(ws,msg)

  })
});

wss.on('close', function close() {
  console.log('close');
});

process.on('SIGINT', () => {
  wss.close();
});
