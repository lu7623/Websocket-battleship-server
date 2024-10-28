import {
  AddShips,
  AddToRoom,
  Attack,
  MessageType,
  RandomAttack,
  UserData,
  WsEvent,
} from 'src/model/types';
import WebSocket from 'ws';
import { dataBase } from 'src/model/database';
import { Controller } from './controller';
import { handleAttack } from './handleAttack';
import { randomCell } from 'src/utils/randomCell';
import { handleAddShips } from './handleAddShips';
import { handleAddUserToRoom } from './handleAddUserToRoom';
import { handleCreateRoom } from './handleCreateRoom';
import { handleReg } from './handleReg';

const clientController = new Controller();

export const eventHandler = (ws: WebSocket, event: WsEvent) => {
  switch (event.type) {
    case MessageType.reg:
      let { name, password } = event.data as UserData;
      handleReg(name, password, clientController, ws);
      break;

    case MessageType.createRoom:
      let userByClient = clientController.getClient(ws);
      if (userByClient) {
        handleCreateRoom(userByClient, clientController);
      }
      break;

    case MessageType.addUserToRoom:
      let { indexRoom } = event.data as AddToRoom;
      let player1 = clientController.getClient(ws);
      let player2 = dataBase.rooms.find((room) => room.id == indexRoom)?.players[0];
      if (player1 && player2 && player1!==player2) handleAddUserToRoom(player1, player2, indexRoom, clientController);
      break;

    case MessageType.addShips:
      let shipInfo = event.data as AddShips;
      handleAddShips(shipInfo, clientController);
      break;

    case MessageType.attack:
      let attack = event.data as Attack;
      let findGame = dataBase.games.find((game) => game.id === attack.gameId);
      if (findGame?.turn === attack.indexPlayer) {
        handleAttack(attack, clientController);
      }
      break;

    case MessageType.randomAttack:
      let randomAttack = event.data as RandomAttack;
      let game = dataBase.games.find((game) => game.id === randomAttack.gameId);
      if (game) {
        let attackedUser = game.players[randomAttack.indexPlayer == 0 ? 1 : 0];
        let attackedField = attackedUser.playerBoard;
        if (attackedField) {
          const [x, y] = randomCell(attackedField);
          handleAttack(Object.assign(randomAttack, { x: x, y: y }), clientController);
        }
      }
      break;
  }
};
