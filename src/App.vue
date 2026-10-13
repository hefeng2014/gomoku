<script setup lang="ts">
import { computed } from 'vue'
import { STAR_POINTS, coordOf } from '@/game'
import type { Stone } from '@/game'
import { useGomoku } from '@/composables/useGomoku'

const { state, mode, thinking, cells, moveCount, isOver, winLine, canUndo, place, undoMove, reset, setMode } =
    useGomoku()

/** 交叉点在棋面上的百分比位置：第 i 条线落在 i / (size - 1) 处。 */
const axis = computed(() =>
    Array.from({ length: state.value.size }, (_, i) => (i / (state.value.size - 1)) * 100),
)

/** 星位只画在 15 路标准盘上。 */
const stars = computed(() => (state.value.size === 15 ? STAR_POINTS : []))

/** 棋盘底色随轮到谁走而变，鼠标悬停的幽灵子也取这个颜色。 */
const turnColor = computed(() => (state.value.current === 'black' ? '#12161F' : '#F3F5F8'))

const stoneName = (stone: Stone): string => (stone === 'black' ? '黑棋' : '白棋')

const statusText = computed(() => {
    const current = state.value

    if (current.status === 'won' && current.win !== null) {
        return `${stoneName(current.win.winner)}胜`
    }
    if (current.status === 'draw') {
        return '和棋'
    }
    if (thinking.value) {
        return '白棋思考中…'
    }
    return `${stoneName(current.current)}落子`
})

/** 玩家此刻能否点这个点：盘内、无子、且这一局还没结束、也不是 AI 在思考。 */
function isPlayable(index: number): boolean {
    return cells.value[index] === null && !isOver.value && !thinking.value
}

function labelFor(index: number): string {
    const { x, y } = coordOf(index, state.value.size)
    const cell = cells.value[index]
    const who = cell === null ? '空位' : stoneName(cell)
    return `第 ${y + 1} 行 第 ${x + 1} 列，${who}`
}

function pointStyle(index: number): Record<string, string> {
    const { x, y } = coordOf(index, state.value.size)
    return { left: `${axis.value[x]}%`, top: `${axis.value[y]}%` }
}
</script>

<template>
    <main class="app">
        <header class="app__head">
            <h1 class="app__title">五子棋</h1>
            <p class="app__subtitle">15 路标准盘 · 先连成五子者胜</p>
        </header>

        <div class="layout">
            <section
                class="board"
                :style="{ '--size': state.size, '--turn-color': turnColor }"
                aria-label="五子棋棋盘"
            >
                <div class="board__field">
                    <svg class="board__lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                        <line
                            v-for="v in axis"
                            :key="`v-${v}`"
                            :x1="v"
                            y1="0"
                            :x2="v"
                            y2="100"
                            vector-effect="non-scaling-stroke"
                        />
                        <line
                            v-for="v in axis"
                            :key="`h-${v}`"
                            x1="0"
                            :y1="v"
                            x2="100"
                            :y2="v"
                            vector-effect="non-scaling-stroke"
                        />
                    </svg>

                    <span
                        v-for="([sx, sy], i) in stars"
                        :key="`star-${i}`"
                        class="board__star"
                        :style="{ left: `${axis[sx]}%`, top: `${axis[sy]}%` }"
                        aria-hidden="true"
                    ></span>

                    <button
                        v-for="(cell, index) in cells"
                        :key="index"
                        type="button"
                        class="point"
                        :class="{
                            'point--taken': cell !== null,
                            'point--playable': isPlayable(index),
                            'point--last': index === state.lastIndex,
                            'point--win': winLine.has(index),
                        }"
                        :style="pointStyle(index)"
                        :disabled="!isPlayable(index)"
                        :aria-label="labelFor(index)"
                        @click="place(index)"
                    >
                        <span v-if="cell !== null" class="stone" :class="`stone--${cell}`"></span>
                    </button>
                </div>
            </section>

            <aside class="panel">
                <div class="status" :class="{ 'status--over': isOver }">
                    <span
                        v-if="!isOver"
                        class="status__chip"
                        :class="`status__chip--${state.current}`"
                        aria-hidden="true"
                    ></span>
                    <span class="status__text">{{ statusText }}</span>
                </div>

                <dl class="meta">
                    <div class="meta__row">
                        <dt>手数</dt>
                        <dd>{{ moveCount }}</dd>
                    </div>
                    <div class="meta__row">
                        <dt>轮到</dt>
                        <dd>{{ isOver ? '—' : stoneName(state.current) }}</dd>
                    </div>
                </dl>

                <div class="field">
                    <span class="field__label">模式</span>
                    <div class="segmented" role="group" aria-label="对局模式">
                        <button
                            type="button"
                            class="segmented__btn"
                            :class="{ 'is-active': mode === 'pve' }"
                            :aria-pressed="mode === 'pve'"
                            @click="setMode('pve')"
                        >
                            人机对战
                        </button>
                        <button
                            type="button"
                            class="segmented__btn"
                            :class="{ 'is-active': mode === 'pvp' }"
                            :aria-pressed="mode === 'pvp'"
                            @click="setMode('pvp')"
                        >
                            双人对战
                        </button>
                    </div>
                </div>

                <div class="actions">
                    <button type="button" class="btn" :disabled="!canUndo" @click="undoMove">悔棋</button>
                    <button type="button" class="btn btn--primary" @click="reset">重开一局</button>
                </div>

                <p class="hint">
                    {{ mode === 'pve' ? '你执黑先行，白棋由电脑执子。' : '黑白轮流，同一台设备上交替落子。' }}
                    轮到的一方点空交叉点即可落子。
                </p>
            </aside>
        </div>
    </main>
</template>
