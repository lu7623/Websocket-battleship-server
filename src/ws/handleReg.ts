import { dataBase } from 'src/model/database';
import { Controller } from './controller';
import { MessageType } from 'src/model/types';
import WebSocket from 'ws';
import { User } from 'src/model/user';

export const handleReg = (
  name: string,
  password: string,
  clientController: Controller,
  ws: WebSocket
) => {
  let currUser = dataBase.users.find((user) => user.name === name);
  if (currUser && currUser.password !== password) {
    clientController.sendToClient(ws, {
      type: MessageType.reg,
      data: {
        name: name,
        index: currUser.id,
        error: true,
        errorText: 'Wrong password',
      },
    });
    return;
  }

  if (!currUser) {
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
  }

  if (currUser && currUser.password === password) {
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
  }

  const winners = dataBase.users.map((currUser) => ({
    name: currUser.name,
    wins: currUser.wins,
  }));
  clientController.sendToAll({
    type: MessageType.updateWinners,
    data: winners,
  });
  if (dataBase.rooms.length > 0) {
    let currRooms = dataBase.rooms.map((room) => ({
      roomId: room.id,
      roomUsers: room.players.map((user) => {
        return {
          name: user.name,
          index: user.id,
        };
      }),
    }));
    clientController.sendToClient(ws, {
      type: MessageType.updateRoom,
      data: currRooms,
    });
  }
};
