import { generateId } from 'src/utils/generateId';
import { User } from './user';
import { Player } from './types';

export class Game {
  id: string;
  players: Player[];

  constructor(player1: User, player2: User) {
    this.id = generateId();
    this.players = [
      { playerId: 0, ships: null, playerBoard: null, user: player1 },
      { playerId: 1, ships: null, playerBoard: null, user: player2 },
    ];
  }
}
