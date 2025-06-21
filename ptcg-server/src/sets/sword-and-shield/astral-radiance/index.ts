import { Card } from '../../../game/store/card/card';

import { OriginFormeDialgaV } from './origin-forme-dialga-v';
import { OriginFormeDialgaVStar } from './origin-forme-dialga-v-star';
import { RadiantGreninja } from './radiant-greninja';

import { DarkPatch } from './dark-patch';
import { HisuianHeavyBall } from './hisuian-heavy-ball';
import { SwitchCart } from './switch-cart';


export const astralRadiance: Card[] = [

  new RadiantGreninja(),

  new OriginFormeDialgaV(),
  new OriginFormeDialgaVStar(),

  new DarkPatch(),
  new HisuianHeavyBall(), // 146


  new SwitchCart(), // 154

];