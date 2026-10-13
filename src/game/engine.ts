import { BOARD_SIZE, FIRST_STONE, WIN_LENGTH } from './constants'
import { createBoard, withStone } from './board'
import { findWin, isFull } from './rules'
import type { GameEvent, GameState, Stone } from './types'

/** 引擎一次落子的结果：新状态 + 供上层消费的事件。 */
export interface PlayResult {
    state: GameState
    events: GameEvent[]
}

/** 造一局新棋。 */
export function createGame(size: number = BOARD_SIZE, winLength: number = WIN_LENGTH): GameState {
    return {
        size,
        winLength,
        board: createBoard(size),
        current: FIRST_STONE,
        status: 'playing',
        win: null,
        moves: [],
        lastIndex: null,
    }
}

/** 对手的颜色。 */
export function opponent(stone: Stone): Stone {
    return stone === 'black' ? 'white' : 'black'
}

/**
 * 在 index 落子。
 *
 * 非法落子（局已终、越界、该点有子）原样返回旧状态并抛 'invalid'，
 * 不抛异常——上层只需要照常赋一次值即可，不必包 try。
 */
export function play(state: GameState, index: number): PlayResult {
    if (state.status !== 'playing') {
        return { state, events: ['invalid'] }
    }
    if (!Number.isInteger(index) || index < 0 || index >= state.board.length) {
        return { state, events: ['invalid'] }
    }
    if (state.board[index] !== null) {
        return { state, events: ['invalid'] }
    }

    const stone = state.current
    const board = withStone(state.board, index, stone)
    const moves = [...state.moves, { index, stone }]
    const line = findWin(board, state.size, state.winLength, index, stone)

    if (line !== null) {
        return {
            state: {
                ...state,
                board,
                moves,
                lastIndex: index,
                status: 'won',
                win: { winner: stone, line },
            },
            events: ['place', 'win'],
        }
    }

    if (isFull(board)) {
        return {
            state: { ...state, board, moves, lastIndex: index, status: 'draw' },
            events: ['place', 'draw'],
        }
    }

    return {
        state: {
            ...state,
            board,
            moves,
            lastIndex: index,
            current: opponent(stone),
        },
        events: ['place'],
    }
}

/**
 * 悔棋：退掉最后 count 手。
 *
 * 棋盘由剩余历史重放得出，而不是在旧盘上「擦掉」——重放不会漏掉终局标记、
 * lastIndex 之类需要一并回滚的字段。无子可退时原样返回。
 */
export function undo(state: GameState, count: number = 1): GameState {
    if (state.moves.length === 0 || count <= 0) {
        return state
    }

    const keep = Math.max(0, state.moves.length - count)
    const moves = state.moves.slice(0, keep)

    const board = createBoard(state.size)
    for (const move of moves) {
        board[move.index] = move.stone
    }

    const last = moves.length > 0 ? moves[moves.length - 1] : null

    return {
        ...state,
        board,
        moves,
        lastIndex: last === null ? null : last.index,
        // 先手恒为黑，所以轮到谁完全由剩余手数的奇偶决定。
        current: moves.length % 2 === 0 ? FIRST_STONE : opponent(FIRST_STONE),
        status: 'playing',
        win: null,
    }
}

/** 重开一局，保留盘面尺寸与连胜长度设置。 */
export function restart(state: GameState): GameState {
    return createGame(state.size, state.winLength)
}
