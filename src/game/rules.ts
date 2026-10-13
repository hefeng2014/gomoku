import { DIRECTIONS } from './constants'
import { coordOf, inBounds, indexOf } from './board'
import type { Board, Stone } from './types'

/**
 * 从刚落下的这一手出发找连子。
 *
 * 只扫经过 lastIndex 的四条线，不做全盘扫描：落子前盘面无胜负，
 * 若此刻出现五连，它必然穿过刚下的这颗子。
 */
export function findWin(
    board: Board,
    size: number,
    winLength: number,
    lastIndex: number,
    stone: Stone,
): number[] | null {
    const { x, y } = coordOf(lastIndex, size)

    for (const [dx, dy] of DIRECTIONS) {
        const line = collectLine(board, size, x, y, dx, dy, stone)
        if (line.length >= winLength) {
            return line
        }
    }

    return null
}

/**
 * 沿 (dx, dy) 双向收集同色连子，返回整条线的下标（含起点，按一端到另一端排序）。
 * 中间被异色子或盘边截断即停——五子棋要的是连续，隔一子的不算。
 */
function collectLine(
    board: Board,
    size: number,
    x: number,
    y: number,
    dx: number,
    dy: number,
    stone: Stone,
): number[] {
    const line = [indexOf(x, y, size)]

    for (const sign of [1, -1] as const) {
        for (let step = 1; step < size; step++) {
            const nx = x + dx * step * sign
            const ny = y + dy * step * sign
            if (!inBounds(nx, ny, size) || board[indexOf(nx, ny, size)] !== stone) {
                break
            }
            if (sign === 1) {
                line.push(indexOf(nx, ny, size))
            } else {
                line.unshift(indexOf(nx, ny, size))
            }
        }
    }

    return line
}

/** 盘面是否已满——满了且无五连即和棋。 */
export function isFull(board: Board): boolean {
    return board.every((cell) => cell !== null)
}

/** 空点数量，供 AI 和「剩余手数」提示使用。 */
export function emptyCount(board: Board): number {
    let count = 0
    for (const cell of board) {
        if (cell === null) {
            count++
        }
    }
    return count
}
