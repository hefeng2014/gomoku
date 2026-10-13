/** 棋子颜色。黑先行。 */
export type Stone = 'black' | 'white'

/** 一格：空位为 null。 */
export type Cell = Stone | null

/** 扁平棋盘：下标 = y * size + x。与 snake 的 CellIndex 约定一致，便于 Set/Map 取值。 */
export type Board = Cell[]

/** 一手落子记录。悔棋就是弹栈，回放也靠它。 */
export interface Move {
    /** 落子格的下标。 */
    index: number
    stone: Stone
}

export type GameStatus = 'playing' | 'won' | 'draw'

/** 终局信息：谁赢、以及制胜的那五子。 */
export interface WinInfo {
    winner: Stone
    /** 连成五子的下标，按从一端到另一端排序，供高亮用。 */
    line: number[]
}

/** 一整局的状态。引擎从不原地修改它，只返回新对象。 */
export interface GameState {
    size: number
    winLength: number
    board: Board
    /** 该谁走了。 */
    current: Stone
    status: GameStatus
    win: WinInfo | null
    /** 落子历史，栈顶为最后一手。 */
    moves: Move[]
    /** 最后一手的下标，用于画「新子」标记；空盘为 null。 */
    lastIndex: number | null
}

/** 引擎抛给上层的事件，由 Vue 层消费（音效、提示文案等）。 */
export type GameEvent = 'place' | 'win' | 'draw' | 'invalid'
