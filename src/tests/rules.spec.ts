import { describe, expect, it } from 'vitest'
import { createBoard, findWin, indexOf, isFull, withStone } from '@/game'
import type { Board, Stone } from '@/game'

const SIZE = 15

/** 按坐标列表铺一条同色线，返回盘面与最后一手的下标。 */
function place(xs: number[], ys: number[], stone: Stone, size: number = SIZE) {
    let board: Board = createBoard(size)
    let lastIndex = 0
    for (let i = 0; i < xs.length; i++) {
        lastIndex = indexOf(xs[i], ys[i], size)
        board = withStone(board, lastIndex, stone)
    }
    return { board, lastIndex }
}

describe('findWin', () => {
    it('认出横向五连', () => {
        const { board, lastIndex } = place([3, 4, 5, 6, 7], [7, 7, 7, 7, 7], 'black')
        expect(findWin(board, SIZE, 5, lastIndex, 'black')).toEqual(
            [3, 4, 5, 6, 7].map((x) => indexOf(x, 7, SIZE)),
        )
    })

    it('认出纵向五连', () => {
        const { board, lastIndex } = place([2, 2, 2, 2, 2], [1, 2, 3, 4, 5], 'white')
        expect(findWin(board, SIZE, 5, lastIndex, 'white')).toHaveLength(5)
    })

    it('认出主对角五连', () => {
        const { board, lastIndex } = place([0, 1, 2, 3, 4], [0, 1, 2, 3, 4], 'black')
        expect(findWin(board, SIZE, 5, lastIndex, 'black')).toHaveLength(5)
    })

    it('认出副对角五连', () => {
        const { board, lastIndex } = place([4, 5, 6, 7, 8], [8, 7, 6, 5, 4], 'white')
        expect(findWin(board, SIZE, 5, lastIndex, 'white')).toHaveLength(5)
    })

    it('被异色子截断的不算五连', () => {
        let board = createBoard(SIZE)
        // 黑黑黑白黑黑黑：看着七子，其实中间断开，两侧各只有三连。
        const xs = [3, 4, 5, 6, 7, 8, 9]
        for (const x of xs) {
            board = withStone(board, indexOf(x, 7, SIZE), 'black')
        }
        board = withStone(board, indexOf(6, 7, SIZE), 'white')

        const lastIndex = indexOf(8, 7, SIZE)
        expect(findWin(board, SIZE, 5, lastIndex, 'black')).toBeNull()
    })

    it('贴边也能成五，不被盘外误判为截断', () => {
        const { board, lastIndex } = place([0, 1, 2, 3, 4], [0, 0, 0, 0, 0], 'black')
        expect(findWin(board, SIZE, 5, lastIndex, 'black')).toHaveLength(5)
    })

    it('长连（六子）返回整条线，交由上层决定怎么展示', () => {
        const { board, lastIndex } = place([2, 3, 4, 5, 6, 7], [9, 9, 9, 9, 9, 9], 'black')
        expect(findWin(board, SIZE, 5, lastIndex, 'black')).toHaveLength(6)
    })

    it('四子连线不算赢', () => {
        const { board, lastIndex } = place([3, 4, 5, 6], [7, 7, 7, 7], 'black')
        expect(findWin(board, SIZE, 5, lastIndex, 'black')).toBeNull()
    })

    it('只认刚落下的这一手所在的线', () => {
        // 盘上另有一条无关的五连，但最后一手不挨着它。
        let board = createBoard(SIZE)
        for (const x of [0, 1, 2, 3, 4]) {
            board = withStone(board, indexOf(x, 0, SIZE), 'white')
        }
        const lastIndex = indexOf(10, 10, SIZE)
        board = withStone(board, lastIndex, 'black')

        expect(findWin(board, SIZE, 5, lastIndex, 'black')).toBeNull()
    })
})

describe('isFull', () => {
    it('有空格时返回 false', () => {
        expect(isFull(createBoard(3))).toBe(false)
    })

    it('全填满时返回 true', () => {
        let board = createBoard(2)
        board = withStone(board, 0, 'black')
        board = withStone(board, 1, 'white')
        board = withStone(board, 2, 'white')
        board = withStone(board, 3, 'black')
        expect(isFull(board)).toBe(true)
    })
})
