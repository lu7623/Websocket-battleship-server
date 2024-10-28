import { Game } from './game';
import { Room } from './room';
import { User } from './user';

export enum MessageType {
  reg = 'reg',
  createRoom = 'create_room',
  addUserToRoom = 'add_user_to_room',
  addShips = 'add_ships',
  attack = 'attack',
  finish = 'finish',
  updateWinners = 'update_winners',
  updateRoom = 'update_room',
  createGame = 'create_game',
  startGame = 'start_game',
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

export type ShipType = 'small' | 'medium' | 'large' | 'huge';

export interface Ship {
  position: Position;
  direction: boolean;
  length: number;
  type: string;
  points?: number;
}

export interface Cell {
  shipNum: number;
  attacked: boolean;
}

export interface Player {
  playerId: 0 | 1;
  user: User;
  ships: null | Ship[];
  playerBoard: null | Cell[][];
  shipsKilled: number;
}

export interface AddToRoom {
  indexRoom: number | string;
}

export interface AddShips {
  gameId: string;
  ships: [
    {
      position: Position;
      direction: boolean;
      length: number;
      type: ShipType;
    },
  ];
  indexPlayer: number;
}

export interface Attack {
  gameId: string;
  x: number;
  y: number;
  indexPlayer: number;
}
