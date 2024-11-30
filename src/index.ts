import { HTTP_PORT } from './constants/constants.js';
import { httpServer } from './http_server/index.js';
import './ws/wsServer.js';

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);
