import { Game } from './game';
import { Room } from './room';
import { User } from './user';

export enum MessageType {
  reg = 'reg',
  create_room = 'create_room',
  add_user_to_room = 'add_user_to_room',
  add_ships = 'add_ships',
  attack = 'attack',
  finish = 'finish',
  update_winners = 'update_winners',
  update_room = 'update_room',
  create_game = 'create_game',
  start_game = 'start_game',
  turn = 'turn',
}

export interface WsEvent {
  type: MessageType;
  data: unknown;
  id: number;
}

export interface UserData {
  name: string;
  password: string;
}

export type DataBase = {
  users: User[];
  rooms: Room[];
  games: Game[];
};

export type Position = {
  x: number;
  y: number;
};

export interface Ship {
  health: number;
  position: Position;
  direction: boolean;
  length: number;
  type: string;
}

export interface Player {
  playerId: 1 | 0;
  user: User;
  ships: null | Ship[];
  playerBoard: null | Cell[][];
}

export interface Cell {
  shipIndex: number;
  fired: boolean;
}

export interface AddToRoom {
  indexRoom: number | string;
}
