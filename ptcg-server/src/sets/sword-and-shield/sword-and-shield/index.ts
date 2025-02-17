import { Card } from '../../../game/store/card/card';

import { Charmander } from '../../sun-and-moon/hidden-fates/charmander';
import { Oranguru } from './oranguru';
import { PokemonCatcher } from './pokemon-catcher';
import { QuickBall } from './quick-ball';
import { Switch } from './switch';


export const swordAndShield: Card[] = [
  new Charmander(),
  new Oranguru(),
  new PokemonCatcher(),
  new QuickBall(),
  new Switch(),
];