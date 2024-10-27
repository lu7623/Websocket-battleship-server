import { generateId } from "src/utils/generateId";
import { User } from "./user";

export class Room {
  id: string;
  players: User[];

  constructor(user: User) {
    this.id = generateId();
    this.players = [user]
  }
}