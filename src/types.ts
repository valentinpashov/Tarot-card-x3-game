export enum GameState {
    IDLE = 'IDLE',
    ROUND_START = 'ROUND_START',
    REVEAL = 'REVEAL',
    RESULT = 'RESULT'
}

export enum GameSpeed {
    NORMAL = 'NORMAL',
    FAST = 'FAST',
    INSTANT = 'INSTANT'
}

export interface MultiplierData {
    value: number;
    chance: number;
}