import { describe, expect, it } from 'vitest'
import { BOARD_SIZE } from '@/game'
import { cellAt, coordOf, createBoard, inBounds, indexOf, withStone } from '@/game'

describe('board', () => {
    it('造出全空的盘面', () => {
        const board = createBoard(5)
        expect(board).toHaveLength(25)
        expect(board.every((cell) => cell === null)).toBe(true)
    })

    it('下标与坐标可以互相还原', () => {
        for (let y = 0; y < BOARD_SIZE; y++) {
            for (let x = 0; x < BOARD_SIZE; x++) {
                expect(coordOf(indexOf(x, y, BOARD_SIZE), BOARD_SIZE)).toEqual({ x, y })
            }
        }
    })

    it('坐标按行优先铺开', () => {
        expect(indexOf(0, 0, 5)).toBe(0)
        expect(indexOf(4, 0, 5)).toBe(4)
        expect(indexOf(0, 1, 5)).toBe(5)
    })

    it('边界判定不放过负数与越界值', () => {
        expect(inBounds(0, 0, 5)).toBe(true)
        expect(inBounds(4, 4, 5)).toBe(true)
        expect(inBounds(5, 4, 5)).toBe(false)
        expect(inBounds(4, 5, 5)).toBe(false)
        expect(inBounds(-1, 0, 5)).toBe(false)
    })

    it('越界一律读回 null，而不是 undefined', () => {
        const board = createBoard(5)
        expect(cellAt(board, -1, 0, 5)).toBeNull()
        expect(cellAt(board, 0, 9, 5)).toBeNull()
    })

    it('落子返回新盘面，旧盘面不动', () => {
        const before = createBoard(3)
        const after = withStone(before, 4, 'black')

        expect(after[4]).toBe('black')
        expect(before[4]).toBeNull()
        expect(after).not.toBe(before)
    })
})
