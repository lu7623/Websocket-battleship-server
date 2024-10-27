import { Room } from "./room";
import { User } from "./user";

export enum ResponseType {
    reg = 'reg',
    create_room = 'create_room',
    add_user_to_room = 'add_user_to_room',
    add_ships = 'add_ships',
    attack = 'attack',
    finish = 'finish',
  }
  
  export enum RequestType {
    reg = 'reg',
    update_winners = 'update_winners',
    update_room = 'update_room',
    create_game = 'create_game',
    start_game = 'start_game',
    turn = 'turn',
  }
  
  export interface WsEvent {
    type: ResponseType | RequestType;
    data: unknown;
    id: number;
  }
  
  export interface UserData {
    name: string;
    password: string;
  }
  
export type DataBase = {
    users: User[],
    rooms: Room[]
}