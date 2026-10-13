import type { Stone } from './types'

/** 标准五子棋棋盘边长（15 × 15 个交叉点）。 */
export const BOARD_SIZE = 15

/** 连成几子算赢。 */
export const WIN_LENGTH = 5

/**
 * 四个扫描方向：横、竖、主对角、副对角。
 * 反方向靠取负得到，所以不必重复列出。
 */
export const DIRECTIONS: ReadonlyArray<readonly [number, number]> = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1],
]

/** 黑棋先行。 */
export const FIRST_STONE: Stone = 'black'

/** 棋盘上的星位（天元 + 四星），仅 15 路盘有；其它尺寸不画。 */
export const STAR_POINTS: ReadonlyArray<readonly [number, number]> = [
    [3, 3],
    [11, 3],
    [3, 11],
    [11, 11],
    [7, 7],
]
