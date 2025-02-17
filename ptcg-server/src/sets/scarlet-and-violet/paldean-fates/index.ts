import { Card } from '../../../game/store/card/card';

import { CharizardEx } from './charizard-ex';
import { Charmander } from './charmander';
import { Charmeleon } from './charmeleon';
import { Pidgeotto } from './pidgeotto';
import { Pidgey } from './pidgey';
import { RareCandy } from './rare-candy';
import { UltraBall } from './ultra-ball';

export const paldeanFates: Card[] = [

  new Charmander(), // 7
  new Charmeleon(),

  new CharizardEx(), // 54

  new Pidgey(), // 196
  new Pidgeotto(),

  new RareCandy(),
  new UltraBall(),
]