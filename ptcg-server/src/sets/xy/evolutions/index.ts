import { Card } from '../../../game/store/card/card';

import { DarknessEnergy } from './darkness-energy';
import { DoubleColorlessEnergy } from './double-colorless-energy';
import { FairyEnergy } from './fairy-energy';
import { FightingEnergy } from './fighting-energy';
import { FireEnergy } from './fire-energy';
import { GrassEnergy } from './grass-energy';
import { LightningEnergy } from './lightning-energy';
import { MetalEnergy } from './metal-energy';
import { PsychicEnergy } from './psychic-energy';
import { WaterEnergy } from './water-energy';


export const evolutions: Card[] = [
  new DarknessEnergy(),
  new DoubleColorlessEnergy(),
  new FairyEnergy(),
  new FightingEnergy(),
  new FireEnergy(),
  new GrassEnergy(),
  new LightningEnergy(),
  new MetalEnergy(),
  new PsychicEnergy(),
  new WaterEnergy(),
];