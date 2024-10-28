import { dataBase } from 'src/model/database';
import { Room } from 'src/model/room';
import { AddShips, AddToRoom, Attack, Cell, MessageType, UserData, WsEvent } from 'src/model/types';
import { User } from 'src/model/user';
import WebSocket from 'ws';
import { Controller } from './controller';
import { Game } from 'src/model/game';
import { setPlayerBoard } from 'src/utils/setPlayerBoard';
import { shipArea } from 'src/utils/shipArea';

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
        clientController.sendToRoom(
          [player1.id, player2.id],
          [
            {
              type: MessageType.createGame,
              data: {
                idGame: newGame.id,
                idPlayer: 0,
              },
            },
            {
              type: MessageType.createGame,
              data: {
                idGame: newGame.id,
                idPlayer: 1,
              },
            },
          ]
        );
      }
      break;

    case MessageType.addShips:
      let shipInfo = event.data as AddShips;
      let currGame = dataBase.games.find((game) => game.id === shipInfo.gameId);
      if (currGame) {
        let player = shipInfo.indexPlayer === 0 ? currGame.players[0] : currGame.players[1];
        player.ships = shipInfo.ships.map((ship) => {
          return Object.assign(ship, { points: ship.length });
        });
        player.playerBoard = setPlayerBoard(shipInfo.ships);
        if (currGame.players[0].playerBoard !== null && currGame.players[1].playerBoard !== null) {
          let payload1 = {
            type: MessageType.startGame,
            data: {
              ships: currGame.players[0].ships,
              currentPlayerIndex: 0,
            },
          };
          let payload2 = {
            type: MessageType.startGame,
            data: {
              ships: currGame.players[1].ships,
              currentPlayerIndex: 1,
            },
          };
          let turn = {
            type: MessageType.turn,
            data: {
              currentPlayer: 0,
            },
          };
          clientController.sendToRoom(
            [currGame.players[0].user.id, currGame.players[1].user.id],
            [payload1, payload2]
          );
          clientController.sendToRoom(
            [currGame.players[0].user.id, currGame.players[1].user.id],
            [turn, turn]
          );
        }
      }
      break;

    case MessageType.attack:
      let attack = event.data as Attack;
      let game = dataBase.games.find((game) => game.id === attack.gameId);
      if (game) {
        let attackedUser = game.players[attack.indexPlayer == 0 ? 1 : 0];
        let attackedField = attackedUser.playerBoard;
        let { x, y } = attack;
        if (attackedField) {
          if (attackedField[y][x].shipNum == null) {
            let attackRes = {
              type: MessageType.attack,
              data: {
                position: {
                  x: x,
                  y: y,
                },
                currentPlayer: attack.indexPlayer,
                status: 'miss',
              },
            };
            let turn = {
              type: MessageType.turn,
              data: {
                currentPlayer: attack.indexPlayer === 0 ? 1 : 0,
              },
            };
            clientController.sendToRoom(
              [game.players[0].user.id, game.players[1].user.id],
              [attackRes, attackRes]
            );
            clientController.sendToRoom(
              [game.players[0].user.id, game.players[1].user.id],
              [turn, turn]
            );
          } else {
            let ship = attackedUser.ships && attackedUser.ships[attackedField[y][x].shipNum];
            if (ship) {
              if (ship.points) {
                ship.points -= 1;
                if (ship.points === 0) {
                  game.players[attack.indexPlayer].shipsKilled += 1;

                  let attackRes = {
                    type: MessageType.attack,
                    data: {
                      position: {
                        x: x,
                        y: y,
                      },
                      currentPlayer: attack.indexPlayer,
                      status: 'killed',
                    },
                  };
                  clientController.sendToRoom(
                    [game.players[0].user.id, game.players[1].user.id],
                    [attackRes, attackRes]
                  );
                  const area = shipArea(ship, attackedField);
                  for (let cell of area) {
                    let res = {
                      type: MessageType.attack,
                      data: {
                        position: {
                          x: cell[1],
                          y: cell[0],
                        },
                        currentPlayer: attack.indexPlayer,
                        status: 'miss',
                      },
                    };
                    clientController.sendToRoom(
                      [game.players[0].user.id, game.players[1].user.id],
                      [res, res]
                    );
                  }
                  if (game.players[attack.indexPlayer].shipsKilled === 10) {
                    let finishRes = {
                      type: 'finish',
                      data: {
                        winPlayer: attack.indexPlayer,
                      },
                    };
                    clientController.sendToRoom(
                      [game.players[0].user.id, game.players[1].user.id],
                      [finishRes, finishRes]
                    );

                    let winner = dataBase.users.find(
                      (user) => user.id === game.players[attack.indexPlayer].user.id
                    );
                    if (winner) winner.wins += 1;
                    const winners = dataBase.users.map((currUser) => ({
                      name: currUser.name,
                      wins: currUser.wins,
                    }));
                    clientController.sendToAll({
                      type: MessageType.updateWinners,
                      data: winners,
                    });
                  }
                } else {
                  let attackRes = {
                    type: MessageType.attack,
                    data: {
                      position: {
                        x: x,
                        y: y,
                      },
                      currentPlayer: attack.indexPlayer,
                      status: 'shot',
                    },
                  };
                  clientController.sendToRoom(
                    [game.players[0].user.id, game.players[1].user.id],
                    [attackRes, attackRes]
                  );
                }
                let turn = {
                  type: MessageType.turn,
                  data: {
                    currentPlayer: attack.indexPlayer,
                  },
                };
                clientController.sendToRoom(
                  [game.players[0].user.id, game.players[1].user.id],
                  [turn, turn]
                );
              }
            }
          }
        }
      }

      break;
  }
};
