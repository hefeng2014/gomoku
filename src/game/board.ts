import type { Board, Cell, Stone } from './types'

/** 造一个空棋盘。 */
export function createBoard(size: number): Board {
    return Array.from({ length: size * size }, (): Cell => null)
}

/** 坐标 → 扁平下标。不做边界检查，调用方自己保证。 */
export function indexOf(x: number, y: number, size: number): number {
    return y * size + x
}

/** 扁平下标 → 坐标。 */
export function coordOf(index: number, size: number): { x: number; y: number } {
    return { x: index % size, y: Math.floor(index / size) }
}

/** 坐标是否落在盘内。 */
export function inBounds(x: number, y: number, size: number): boolean {
    return x >= 0 && x < size && y >= 0 && y < size
}

/** 只读地取一格。越界一律返回 null，省得调用方到处写边界判断。 */
export function cellAt(board: Board, x: number, y: number, size: number): Cell {
    if (!inBounds(x, y, size)) {
        return null
    }
    return board[indexOf(x, y, size)] ?? null
}

/**
 * 落子，返回新棋盘。
 * 引擎不改旧状态，Vue 才能靠引用变化触发重渲染，悔棋也才有现成的历史可退。
 */
export function withStone(board: Board, index: number, stone: Stone): Board {
    const next = board.slice()
    next[index] = stone
    return next
}
