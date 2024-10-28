import { User } from 'src/model/user';
import { Controller } from './controller';
import { dataBase } from 'src/model/database';
import { MessageType } from 'src/model/types';
import { Game } from 'src/model/game';

export const handleAddUserToRoom = (
  player1: User,
  player2: User,
  indexRoom: string,
  clientController: Controller
) => {
  dataBase.rooms = dataBase.rooms.filter((room) => room.id !== indexRoom);
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
};
