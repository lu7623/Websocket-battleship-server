import { generateId } from "src/utils/generateId";
import { UserData } from "./types";

export class User {
  name: string;
  password: string;
  id: string;
  wins: number;

  constructor(newUserData: UserData) {
    this.name = newUserData.name;
    this.password = newUserData.password;
    this.id = generateId();
    this.wins = 0;
  }
}