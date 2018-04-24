export const cellState = {
  hidden: Symbol('hidden'),
  revealed: Symbol('revealed')
};

export const difficulties = {
  easy: { width: 8, height: 8, mines: 7 },
  medium: { width: 12, height: 12, mines: 18 },
  hard: { width: 16, height: 16, mines: 35 },
};

const defaultCell = {
  isMine: false,
  state: cellState.hidden,
  touchCount: 0,
};

const inBounds = (game, { x, y }) =>
  x >= 0
  && x < game.width
  && y >= 0
  && y < game.height;

export const neighboursOf = (game, { x, y }) =>
  [
    { x: x - 1, y: y - 1 },
    { x, y: y - 1 },
    { x: x + 1, y: y - 1 },

    { x: x - 1, y },
    { x: x + 1, y },

    { x: x - 1, y: y + 1 },
    { x, y: y + 1 },
    { x: x + 1, y: y + 1 },
  ]
    .filter(p => inBounds(game, p))

const assignMines = (game, remaining) => {
  if (remaining <= 0) {
    return game;
  }

  const x = Math.floor(Math.random() * game.width);
  const y = Math.floor(Math.random() * game.height);
  const cell = getCell(game, { x, y });
  if (cell.isMine) {
    return assignMines(game, remaining);
  }

  const surrounding = neighboursOf(game, { x, y });

  const updates = surrounding.reduce((nextGame, neighbour) => {
    const cell = getCell(nextGame, neighbour);

    return setCell(nextGame, neighbour, { touchCount: cell.touchCount + 1 });
  }, setCell(game, { x, y }, { isMine: true }));

  return assignMines(updates, remaining - 1);
};

export const create = ({ width = 8, height = 8, mines = 0, startedAt = Date.now() }) => {
  if (width < 8 || height < 8) {
    throw new Error('Minesweeper must be at least 8x8');
  }
  const size = width * height;
  if (mines >= size) {
    throw new Error('Minesweeper must have no more than width*height-1 mines');
  }

  const cells = ' '.repeat(size).split('').map(() => ({ ...defaultCell }));

  return assignMines({
    cells,
    width,
    height,
    alive: true,
    startedAt,
    endedAt: null,
  }, mines);
};

export const getCell = (game, { x, y }) => {
  if (!inBounds(game, { x, y })) return undefined;

  const cell = game.cells[(y * game.width) + x];
  return cell ? { ...cell } : cell;
};

export const setCell = (game, { x, y }, updates = {}) => {
  if (!inBounds(game, { x, y })) {
    return game;
  }

  const index = (y * game.width) + x;

  const head = game.cells.slice(0, index);

  const updated = ['isMine', 'state', 'touchCount'].reduce((c, key) => {
    const value = updates[key];
    if (typeof value === 'undefined') return c;
    return { ...c, [key]: value };
  }, game.cells[index]);

  const tail = game.cells.slice(index + 1);

  return {
    ...game,
    cells: head.concat(updated, tail),
  };
};

export const reveal = (game, { x, y, now = Date.now() }) => {
  if (game.endedAt) return game;

  const cell = getCell(game, { x, y });
  if (!cell) {
    return game;
  }

  const onlyMinesLeft = game.cells
    .filter(c => c.state === cellState.hidden)
    .every(c => c.isMine);

  const { isMine } = cell;

  const endGame = isMine || onlyMinesLeft;

  return {
    ...setCell(game, { x, y }, { state: cellState.revealed }),
    alive: !isMine,
    endedAt: endGame ? now : null,
  };
};

export const toRows = (game, { cheat = false }) => {
  let rows = [];
  for(let r = 0; r < game.height; r++) {
    const index = r * game.width;
    const row = game.cells.slice(index, index + game.width);
    rows.push(
      cheat
      ? row
      : row.map(c => {
        if (c.state === cellState.revealed) return c;
        return {
          ...c,
          isMine: null,
          touchCount: null,
        };
      })
    );
  }
  return rows;
}
