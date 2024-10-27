import { dataBase } from 'src/model/database';
import { Room } from 'src/model/room';
import { AddToRoom, MessageType, UserData, WsEvent } from 'src/model/types';
import { User } from 'src/model/user';
import WebSocket from 'ws';
import { Controller } from './controller';
import { Game } from 'src/model/game';

const clientController = new Controller();

export const eventHandler = (ws: WebSocket, event: WsEvent) => {
  switch (event.type) {
    case MessageType.reg:
      let { name, password } = event.data as UserData;
      let currUser = dataBase.users.find((user) => user.name === name);

      if (currUser) {
        if (currUser.password === password) {
          clientController.setClient(currUser.id, ws);
          clientController.sendToClient(ws, {
            type: MessageType.reg,
            data: {
              name: name,
              index: currUser.id,
              error: false,
              errorText: '',
            },
          });
          const winners = dataBase.users.map((currUser) => ({
            name: currUser.name,
            wins: currUser.wins,
          }));
          clientController.sendToAll({
            type: MessageType.update_winners,
            data: winners,
          });
        } else {
          clientController.sendToClient(ws, {
            type: MessageType.reg,
            data: {
              name: name,
              index: currUser.id,
              error: true,
              errorText: 'Wrong password',
            },
          });
        }
      } else {
        let newUser = new User({ name: name, password: password });
        dataBase.users.push(newUser);
        clientController.setClient(newUser.id, ws);
        clientController.sendToClient(ws, {
          type: MessageType.reg,
          data: {
            name: name,
            index: newUser.id,
            error: false,
            errorText: '',
          },
        });
        const winners = dataBase.users.map((currUser) => ({
          name: currUser.name,
          wins: currUser.wins,
        }));
        clientController.sendToAll({
          type: MessageType.update_winners,
          data: winners,
        });
      }
      break;

    case MessageType.create_room:
      let userByClient = clientController.getClient(ws);
      if (userByClient) {
        let newRoom = new Room(userByClient);
        dataBase.rooms.push(newRoom);
        let currRooms = dataBase.rooms.map((room) => ({
          roomId: room.id,
          roomUsers: room.players.filter(Boolean).map((user) => {
            return {
              name: user.name,
              index: user.id,
            };
          }),
        }));
        clientController.sendToAll({
          type: MessageType.update_room,
          data: currRooms,
        });
      }

      break;

    case MessageType.add_user_to_room:
      let { indexRoom } = event.data as AddToRoom;
      let player1 = clientController.getClient(ws);
      let player2 = dataBase.rooms.find((room) => room.id == indexRoom)?.players[0];
      dataBase.rooms = dataBase.rooms.filter((room) => room.id !== indexRoom);
      if (player1 && player2) {
        let currRooms = dataBase.rooms.map((room) => ({
          roomId: room.id,
          roomUsers: room.players.filter(Boolean).map((user) => {
            return {
              name: user.name,
              index: user.id,
            };
          }),
        }));
        clientController.sendToAll({
          type: MessageType.update_room,
          data: currRooms,
        });
        let newGame = new Game(player1, player2);
        dataBase.games.push(newGame);
        let client2 = clientController.getClientById(player2.id);
        client2 &&
          clientController.sendToClient(client2, {
            type: MessageType.create_game,
            data: {
              idGame: newGame.id,
              idPlayer: 1,
            },
          });
        clientController.sendToClient(ws, {
          type: MessageType.create_game,
          data: {
            idGame: newGame.id,
            idPlayer: 0,
          },
        });
      }
  }
};
