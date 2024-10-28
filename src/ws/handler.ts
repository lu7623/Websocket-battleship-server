import { dataBase } from 'src/model/database';
import { Room } from 'src/model/room';
import { AddShips, AddToRoom, Cell, MessageType, UserData, WsEvent } from 'src/model/types';
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
      break;

    case MessageType.createRoom:
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
          type: MessageType.updateRoom,
          data: currRooms,
        });
      }

      break;

    case MessageType.addUserToRoom:
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
          type: MessageType.updateRoom,
          data: currRooms,
        });
        let newGame = new Game(player1, player2);
        dataBase.games.push(newGame);
        clientController.sendToRoom([player1.id, player2.id], [
            {
                type: MessageType.createGame,
                data: {
                  idGame: newGame.id,
                  idPlayer: 0,
                },
              }, {
                type: MessageType.createGame,
                data: {
                  idGame: newGame.id,
                  idPlayer: 1,
                },
              }
        ])
       
      } 
      break

      case MessageType.addShips: 
      let shipInfo = event.data as AddShips;
      let currGame = dataBase.games.find(game => game.id === shipInfo.gameId);
     if (currGame){
       let player = shipInfo.indexPlayer === 0 ? currGame.players[0] : currGame.players[1];
       player.ships = shipInfo.ships;
       let playerBoard:Cell[][] = Array.from(Array(10), () => new Array(10).fill({
        isShip:  0,
        attacked: false
      }))

      shipInfo.ships.forEach((ship) => {
        let {x, y} = ship.position;
        playerBoard[y][x] = {
            isShip:  1,
            attacked: false
        }
        if (ship.length>1 && ship.direction == false) {
            for (let i=1; i<ship.length; i++){
                playerBoard[y][x+i] = {
                    isShip:  1,
                    attacked: false
                }
            }
        } else if (ship.length>1 && ship.direction === true) {
            for (let i=1; i<ship.length; i++){
                playerBoard[y+i][x] = {
                    isShip:  1,
                    attacked: false
                }
            }
        }
      })

      console.log(playerBoard);
      player.playerBoard = playerBoard;
      if (currGame.players[0].playerBoard!==null &&  currGame.players[1].playerBoard!==null) {
        let payload1 = {
            type: MessageType.startGame,
            data: {
              ships: currGame.players[0].ships,
              currentPlayerIndex: 0
            },
          }
          let payload2 ={
            type: MessageType.startGame,
            data: {
              ships: currGame.players[1].ships,
              currentPlayerIndex: 1
            },
          }
        clientController.sendToRoom([currGame.players[0].user.id, currGame.players[1].user.id], [payload1, payload2]);
      }
     } 
     break
  }
};
