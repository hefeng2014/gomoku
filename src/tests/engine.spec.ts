import { describe, expect, it } from 'vitest'
import { createGame, indexOf, opponent, play, restart, undo } from '@/game'
import type { GameState } from '@/game'

const SIZE = 15

/** 依次落子，返回最终状态。用于把一局棋快速摆到位。 */
function playAll(state: GameState, indexes: number[]): GameState {
    let next = state
    for (const index of indexes) {
        next = play(next, index).state
    }
    return next
}

describe('createGame', () => {
    it('开局是空盘、黑先、进行中', () => {
        const game = createGame()
        expect(game.size).toBe(SIZE)
        expect(game.current).toBe('black')
        expect(game.status).toBe('playing')
        expect(game.win).toBeNull()
        expect(game.moves).toHaveLength(0)
        expect(game.lastIndex).toBeNull()
    })
})

describe('opponent', () => {
    it('黑白互为对手', () => {
        expect(opponent('black')).toBe('white')
        expect(opponent('white')).toBe('black')
    })
})

describe('play', () => {
    it('落子后交给对方', () => {
        const first = play(createGame(), indexOf(7, 7, SIZE))
        expect(first.state.board[indexOf(7, 7, SIZE)]).toBe('black')
        expect(first.state.current).toBe('white')
        expect(first.events).toEqual(['place'])

        const second = play(first.state, indexOf(8, 8, SIZE))
        expect(second.state.board[indexOf(8, 8, SIZE)]).toBe('white')
        expect(second.state.current).toBe('black')
    })

    it('已经落子的点不能重下', () => {
        const game = play(createGame(), indexOf(7, 7, SIZE)).state
        const again = play(game, indexOf(7, 7, SIZE))

        expect(again.events).toEqual(['invalid'])
        expect(again.state).toBe(game)
    })

    it('越界与非法下标被挡下', () => {
        const game = createGame()
        for (const bad of [-1, 225, 1.5, Number.NaN]) {
            expect(play(game, bad).events).toEqual(['invalid'])
        }
    })

    it('五连即胜，并记下制胜线', () => {
        // 黑走 (3..7, 7)，白在别处应付。
        const game = playAll(createGame(), [
            indexOf(3, 7, SIZE),
            indexOf(0, 0, SIZE),
            indexOf(4, 7, SIZE),
            indexOf(1, 0, SIZE),
            indexOf(5, 7, SIZE),
            indexOf(2, 0, SIZE),
            indexOf(6, 7, SIZE),
            indexOf(0, 1, SIZE),
            indexOf(7, 7, SIZE),
        ])

        expect(game.status).toBe('won')
        expect(game.win?.winner).toBe('black')
        expect(game.win?.line).toEqual([3, 4, 5, 6, 7].map((x) => indexOf(x, 7, SIZE)))
    })

    it('胜负已分之后不再接受落子', () => {
        const game = playAll(createGame(), [
            indexOf(3, 7, SIZE),
            indexOf(0, 0, SIZE),
            indexOf(4, 7, SIZE),
            indexOf(1, 0, SIZE),
            indexOf(5, 7, SIZE),
            indexOf(2, 0, SIZE),
            indexOf(6, 7, SIZE),
            indexOf(0, 1, SIZE),
            indexOf(7, 7, SIZE),
        ])

        const after = play(game, indexOf(10, 10, SIZE))
        expect(after.events).toEqual(['invalid'])
        expect(after.state).toBe(game)
    })

    it('小盘填满且无五连即和棋', () => {
        // 3×3 盘、要求连 5 子：永远赢不了，填满只能和。
        let game = createGame(3, 5)
        for (let index = 0; index < 9; index++) {
            game = play(game, index).state
        }

        expect(game.status).toBe('draw')
        expect(game.win).toBeNull()
    })
})

describe('undo', () => {
    it('退一手后把该谁走还回去', () => {
        const game = playAll(createGame(), [indexOf(7, 7, SIZE), indexOf(8, 8, SIZE)])
        expect(game.current).toBe('black')

        const back = undo(game, 1)
        expect(back.board[indexOf(8, 8, SIZE)]).toBeNull()
        expect(back.board[indexOf(7, 7, SIZE)]).toBe('black')
        expect(back.current).toBe('white')
        expect(back.moves).toHaveLength(1)
        expect(back.lastIndex).toBe(indexOf(7, 7, SIZE))
    })

    it('退两手回到空盘', () => {
        const game = playAll(createGame(), [indexOf(7, 7, SIZE), indexOf(8, 8, SIZE)])
        const back = undo(game, 2)

        expect(back.moves).toHaveLength(0)
        expect(back.lastIndex).toBeNull()
        expect(back.current).toBe('black')
        expect(back.board.every((cell) => cell === null)).toBe(true)
    })

    it('能撤销终局，把状态收回进行中', () => {
        const game = playAll(createGame(), [
            indexOf(3, 7, SIZE),
            indexOf(0, 0, SIZE),
            indexOf(4, 7, SIZE),
            indexOf(1, 0, SIZE),
            indexOf(5, 7, SIZE),
            indexOf(2, 0, SIZE),
            indexOf(6, 7, SIZE),
            indexOf(0, 1, SIZE),
            indexOf(7, 7, SIZE),
        ])
        expect(game.status).toBe('won')

        const back = undo(game, 1)
        expect(back.status).toBe('playing')
        expect(back.win).toBeNull()
        expect(back.current).toBe('black')
    })

    it('空盘上悔棋是空操作', () => {
        const game = createGame()
        expect(undo(game, 1)).toBe(game)
    })

    it('退得比历史还多时退到空盘为止', () => {
        const game = playAll(createGame(), [indexOf(7, 7, SIZE)])
        const back = undo(game, 99)
        expect(back.moves).toHaveLength(0)
        expect(back.board.every((cell) => cell === null)).toBe(true)
    })
})

describe('restart', () => {
    it('重开清空盘面但保留尺寸设置', () => {
        const game = playAll(createGame(9, 4), [indexOf(4, 4, 9), indexOf(5, 5, 9)])
        const fresh = restart(game)

        expect(fresh.size).toBe(9)
        expect(fresh.winLength).toBe(4)
        expect(fresh.moves).toHaveLength(0)
        expect(fresh.status).toBe('playing')
    })
})
