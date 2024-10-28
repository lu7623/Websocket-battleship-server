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
        type: MessageType.updateWinners,
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
      type: MessageType.updateWinners,
      data: winners,
    });
  }
};
