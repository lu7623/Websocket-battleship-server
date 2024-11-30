import { Cell, Ship } from 'src/model/types';

export const shipArea = (ship: Ship, board: Cell[][]) => {
  let { x, y } = ship.position;
  const area = [];
  if (ship.direction == false) {
    for (let i = -1; i <= ship.length; i++) {
      if (y >= 1 && board[y - 1]?.[x + i]) area.push([y - 1, x + i]);
      if (board[y + 1]?.[x + i]) area.push([y + 1, x + i]);
      if (x >= 1 && board[y]?.[x - 1]) area.push([y, x - 1]);
      if (board[y]?.[x + ship.length]) area.push([y, x + ship.length]);
    }
  } else if (ship.direction === true) {
    for (let i = -1; i <= ship.length; i++) {
      if (board[y + i]?.[x + 1]) area.push([y + i, x + 1]);
      if (x >= 1 && board[y + i]?.[x - 1]) area.push([y + i, x - 1]);
      if (y >= 1 && board[y - 1]?.[x]) area.push([y - 1, x]);
      if (board[y + ship.length]?.[x]) area.push([y + ship.length, x]);
    }
  }
  return area;
};
