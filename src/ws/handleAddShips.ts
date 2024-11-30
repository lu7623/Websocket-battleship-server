import { AddShips, MessageType } from 'src/model/types';
import { Controller } from './controller';
import { dataBase } from 'src/model/database';
import { setPlayerBoard } from 'src/utils/setPlayerBoard';

export const handleAddShips = (shipInfo: AddShips, clientController: Controller) => {
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
};
