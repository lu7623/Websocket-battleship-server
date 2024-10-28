import { dataBase } from 'src/model/database';
import { Attack, MessageType } from 'src/model/types';
import { Controller } from './controller';
import { shipArea } from 'src/utils/shipArea';

export const handleAttack = (attack: Attack, clientController: Controller) => {
  let game = dataBase.games.find((game) => game.id === attack.gameId);
  if (game) {
    let attackedUser = game.players[attack.indexPlayer == 0 ? 1 : 0];
    let attackedField = attackedUser.playerBoard;
    let { x, y } = attack;
    if (attackedField) {
      if (attackedField[y][x].shipNum == null) {
        attackedField[y][x].attacked = true;
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
        game.turn=attack.indexPlayer === 0 ? 1 : 0
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
        attackedField[y][x].attacked = true;
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
                attackedField[cell[1]][cell[0]].attacked = true;
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
                  type: MessageType.finish,
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
            game.turn = attack.indexPlayer==0 ? 0 : 1;
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
};
