import { generateId } from 'src/utils/generateId';
import { User } from './user';
import { Player } from './types';

export class Game {
  id: string;
  players: Player[];
  turn: 0 | 1;
  constructor(player1: User, player2: User) {
    this.id = generateId();
    this.turn=0;
    this.players = [
      { playerId: 0, ships: null, playerBoard: null, user: player1, shipsKilled: 0 },
      { playerId: 1, ships: null, playerBoard: null, user: player2, shipsKilled: 0 },
    ];
  }
}
