import { WebSocketServer } from 'ws';

export const wss = new WebSocketServer({ port: 3000 });

wss.on('connection', (ws, req) => {
  console.log('Websocket connection succesfully established.');

  ws.on('message', (rawMessage) => {
    console.log(JSON.parse(rawMessage));
  });
});

wss.on('close', function close() {
  console.log('close');
});

process.on('SIGINT', () => {
  wss.close();
});
