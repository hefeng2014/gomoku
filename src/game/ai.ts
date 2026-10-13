import { DIRECTIONS } from './constants'
import { cellAt, coordOf, inBounds, indexOf } from './board'
import type { Board, Stone } from './types'

/**
 * 连子长度 → 基础分。
 * 指数级拉开档次，保证 AI 宁可自己成五，也不会为了堵一个活三而放掉自己的活四。
 */
const SHAPE_SCORE: Readonly<Record<number, number>> = {
    1: 10,
    2: 100,
    3: 1000,
    4: 10000,
    5: 100000,
}

/** 两端都被堵死的连子毫无价值，直接归零。 */
const OPEN_BOTH = 3
const OPEN_ONE = 1
const OPEN_NONE = 0

/**
 * 极简估值 AI：对每个空点算「我下这里」与「对手下这里」的威胁分，取加权和最高的点。
 *
 * 不做博弈搜索——一层贪心够业余对局用，好处是落子瞬时返回，
 * 且行为完全确定，测试里可以逐点断言。
 */
export function suggestMove(board: Board, size: number, stone: Stone, foe: Stone): number | null {
    const empties = collectEmpties(board)
    if (empties.length === 0) {
        return null
    }

    // 开局空盘：所有点分数相同，随便挑会落在角上，下天元更自然。
    if (empties.length === board.length) {
        const center = Math.floor(size / 2)
        return indexOf(center, center, size)
    }

    let best = empties[0]
    let bestScore = -1

    for (const index of empties) {
        const { x, y } = coordOf(index, size)
        let attack = 0
        let defend = 0

        for (const [dx, dy] of DIRECTIONS) {
            attack += shapeScore(board, size, x, y, dx, dy, stone)
            defend += shapeScore(board, size, x, y, dx, dy, foe)
        }

        // 攻击略重于防守：否则 AI 会一味跟着堵，自己的活四也视而不见。
        const score = attack * 1.05 + defend
        if (score > bestScore) {
            bestScore = score
            best = index
        }
    }

    return best
}

/** 盘面所有空点的下标，按行优先顺序。 */
function collectEmpties(board: Board): number[] {
    const empties: number[] = []
    for (let index = 0; index < board.length; index++) {
        if (board[index] === null) {
            empties.push(index)
        }
    }
    return empties
}

/**
 * 假设 (x, y) 落下一颗 stone，沿 (dx, dy) 估这条线的价值。
 * 只看"连续同色子数"和"两端开阔度"，不考虑跳子棋型——够用，且好解释。
 */
function shapeScore(
    board: Board,
    size: number,
    x: number,
    y: number,
    dx: number,
    dy: number,
    stone: Stone,
): number {
    let count = 1
    let open = 0

    for (const sign of [1, -1] as const) {
        for (let step = 1; step < size; step++) {
            const nx = x + dx * step * sign
            const ny = y + dy * step * sign
            const cell = cellAt(board, nx, ny, size)

            if (cell === stone) {
                count++
                continue
            }
            // 空位算一个活口；异色子或盘外则此向到此为止。
            if (cell === null && inBounds(nx, ny, size)) {
                open++
            }
            break
        }
    }

    const base = SHAPE_SCORE[Math.min(count, 5)] ?? 0

    if (open === 0) {
        return base * OPEN_NONE
    }
    return open === 2 ? base * OPEN_BOTH : base * OPEN_ONE
}
