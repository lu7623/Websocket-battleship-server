import { FIELD_SIZE } from 'src/constants/constants';
import { Cell } from 'src/model/types';

export const randomCell = (board: Cell[][]) => {
  while (true) {
    let x = Math.floor(Math.random() * FIELD_SIZE);
    let y = Math.floor(Math.random() * FIELD_SIZE);
    if (!board[y][x].attacked) return [x, y];
  }
};
