import { MultiplierData } from "./types";

export const BET_OPTIONS = [0.5, 1, 2, 5, 10];

export const PAY_TABLE: MultiplierData[] = [
    { value: 10.0, chance: 3.0 },
    { value: 5.0,  chance: 6.0 },
    { value: 3.0,  chance: 13.0 },
    { value: 2.0,  chance: 23.0 },
    { value: 1.0,  chance: 55.0 },
    { value: 4.0,  chance: 7.0 },
    { value: 2.0,  chance: 9.0 },
    { value: 0.6,  chance: 15.0 },
    { value: 0.3,  chance: 50.0 },
    { value: 0.0,  chance: 19.0 }, 
];