export { BOARD_SIZE, DIRECTIONS, FIRST_STONE, STAR_POINTS, WIN_LENGTH } from './constants'
export { cellAt, coordOf, createBoard, inBounds, indexOf, withStone } from './board'
export { emptyCount, findWin, isFull } from './rules'
export { createGame, opponent, play, restart, undo } from './engine'
export { suggestMove } from './ai'

export type { PlayResult } from './engine'
export type { Board, Cell, GameEvent, GameState, GameStatus, Move, Stone, WinInfo } from './types'
