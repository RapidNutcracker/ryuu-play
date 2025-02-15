import { CardType } from './card-types';

export interface Weakness {
  type: CardType;
  value?: number; // when undefined, then it's x2
}

export interface Resistance {
  type: CardType;
  value: number;
  operator?: string;
}

export interface Attack {
  cost: CardType[];
  damage: number;
  name: string;
  text: string;
  useFromBench?: boolean;
}

export enum PowerType {
  POKEMON_POWER,
  POKEBODY,
  POKEPOWER,
  ABILITY,
  ANCIENT_TRAIT,
}

export interface Power {
  name: string;
  powerType: PowerType;
  text: string;
  useWhenInPlay?: boolean;
  useFromHand?: boolean;
  useFromDiscard?: boolean;
}
