import { dataBase } from 'src/model/database';
import { Room } from 'src/model/room';
import { User } from 'src/model/user';
import { Controller } from './controller';
import { MessageType } from 'src/model/types';

export const handleCreateRoom = (userByClient: User, clientController: Controller) => {
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
};
