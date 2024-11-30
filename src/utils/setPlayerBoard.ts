import { Cell, Ship } from 'src/model/types';

export const setPlayerBoard = (ships: Ship[]) => {
  let playerBoard: Cell[][] = Array.from(Array(10), () =>
    new Array(10).fill({
      isShip: null,
      attacked: false,
    })
  );

  ships.forEach((ship, ind) => {
    let { x, y } = ship.position;
    playerBoard[y][x] = {
      shipNum: ind,
      attacked: false,
    };
    if (ship.length > 1 && ship.direction == false) {
      for (let i = 1; i < ship.length; i++) {
        playerBoard[y][x + i] = {
          shipNum: ind,
          attacked: false,
        };
      }
    } else if (ship.length > 1 && ship.direction === true) {
      for (let i = 1; i < ship.length; i++) {
        playerBoard[y + i][x] = {
          shipNum: ind,
          attacked: false,
        };
      }
    }
  });
  return playerBoard;
};
