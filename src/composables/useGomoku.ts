import { computed, shallowRef } from 'vue'
import { BOARD_SIZE, WIN_LENGTH, createGame, opponent, play, restart, suggestMove, undo } from '@/game'
import type { GameState, Stone } from '@/game'

/** 双人轮流，或人机对战。 */
export type Mode = 'pvp' | 'pve'

/** 人机模式下 AI 执白，玩家执黑先行。 */
const AI_STONE: Stone = 'white'

/** AI 落子前的停顿，让玩家看清自己那一手，否则会像点下去没反应。 */
const AI_DELAY_MS = 260

export function useGomoku() {
    // 状态是整体替换的不可变对象，用 shallowRef 就够：
    // 深响应式会去代理 225 个格子和整个历史栈，纯属白费。
    const state = shallowRef<GameState>(createGame(BOARD_SIZE, WIN_LENGTH))
    const mode = shallowRef<Mode>('pve')
    const thinking = shallowRef(false)

    const cells = computed(() => state.value.board)
    const moveCount = computed(() => state.value.moves.length)
    const isOver = computed(() => state.value.status !== 'playing')
    /** 制胜线用 Set 存，模板里 O(1) 判断某格要不要高亮。 */
    const winLine = computed(() => new Set(state.value.win?.line ?? []))
    const canUndo = computed(() => state.value.moves.length > 0 && !thinking.value)

    /** 轮到 AI 走棋时排一手。 */
    function scheduleAi(): void {
        thinking.value = true
        window.setTimeout(() => {
            const current = state.value
            // 这期间可能已经悔棋或重开，落子前重新确认轮次。
            if (current.status === 'playing' && current.current === AI_STONE) {
                const index = suggestMove(current.board, current.size, AI_STONE, opponent(AI_STONE))
                if (index !== null) {
                    state.value = play(current, index).state
                }
            }
            thinking.value = false
        }, AI_DELAY_MS)
    }

    /** 玩家（或双人模式下的任意一方）落子。 */
    function place(index: number): void {
        if (thinking.value) {
            return
        }

        const result = play(state.value, index)
        if (result.events.includes('invalid')) {
            return
        }
        state.value = result.state

        if (mode.value === 'pve' && state.value.current === AI_STONE && state.value.status === 'playing') {
            scheduleAi()
        }
    }

    function undoMove(): void {
        if (!canUndo.value) {
            return
        }

        const current = state.value
        // 人机模式要退到「轮到玩家」为止：玩家执黑，所以剩余手数为奇数时
        // 只需退一手，偶数时得退两手，否则悔棋等于白送 AI 一个回合。
        const steps = mode.value === 'pve' && current.moves.length % 2 === 0 ? 2 : 1
        state.value = undo(current, steps)
    }

    function reset(): void {
        thinking.value = false
        state.value = restart(state.value)
    }

    function setMode(next: Mode): void {
        if (next === mode.value) {
            return
        }
        mode.value = next
        reset()
    }

    return {
        state,
        mode,
        thinking,
        cells,
        moveCount,
        isOver,
        winLine,
        canUndo,
        place,
        undoMove,
        reset,
        setMode,
    }
}
