import { describe, expect, it } from 'vitest'
import { createBoard, indexOf, suggestMove, withStone } from '@/game'
import type { Board, Stone } from '@/game'

const SIZE = 15
const BLACK: Stone = 'black'
const WHITE: Stone = 'white'

/** 按坐标铺一串同色子。 */
function line(board: Board, xs: number[], ys: number[], stone: Stone): Board {
    let next = board
    for (let i = 0; i < xs.length; i++) {
        next = withStone(next, indexOf(xs[i], ys[i], SIZE), stone)
    }
    return next
}

describe('suggestMove', () => {
    it('空盘下天元', () => {
        const move = suggestMove(createBoard(SIZE), SIZE, BLACK, WHITE)
        expect(move).toBe(indexOf(7, 7, SIZE))
    })

    it('满盘无点可下时返回 null', () => {
        let board = createBoard(2)
        board = withStone(board, 0, BLACK)
        board = withStone(board, 1, WHITE)
        board = withStone(board, 2, WHITE)
        board = withStone(board, 3, BLACK)

        expect(suggestMove(board, 2, BLACK, WHITE)).toBeNull()
    })

    it('自己能成五时立刻成五，而不是去堵对手', () => {
        // 黑有四连 (3..6, 7)，白也有四连 (3..6, 9)。轮到黑，黑必须自己赢。
        let board = createBoard(SIZE)
        board = line(board, [3, 4, 5, 6], [7, 7, 7, 7], BLACK)
        board = line(board, [3, 4, 5, 6], [9, 9, 9, 9], WHITE)

        const move = suggestMove(board, SIZE, BLACK, WHITE)
        expect([indexOf(2, 7, SIZE), indexOf(7, 7, SIZE)]).toContain(move)
    })

    it('对手有四连时去堵', () => {
        // 白有四连 (3..6, 9)，黑只有散子。轮到黑，必须堵两端之一。
        let board = createBoard(SIZE)
        board = line(board, [3, 4, 5, 6], [9, 9, 9, 9], WHITE)
        board = withStone(board, indexOf(7, 7, SIZE), BLACK)

        const move = suggestMove(board, SIZE, BLACK, WHITE)
        expect([indexOf(2, 9, SIZE), indexOf(7, 9, SIZE)]).toContain(move)
    })

    it('不会落在已占的点上', () => {
        let board = createBoard(SIZE)
        board = line(board, [3, 4, 5], [7, 7, 7], BLACK)
        board = line(board, [3, 4, 5], [8, 8, 8], WHITE)

        const move = suggestMove(board, SIZE, WHITE, BLACK)
        expect(move).not.toBeNull()
        expect(board[move as number]).toBeNull()
    })

    it('总是挑一个盘内的合法点', () => {
        let board = createBoard(SIZE)
        board = withStone(board, indexOf(0, 0, SIZE), BLACK)

        const move = suggestMove(board, SIZE, WHITE, BLACK)
        expect(move).toBeGreaterThanOrEqual(0)
        expect(move).toBeLessThan(SIZE * SIZE)
    })
})
