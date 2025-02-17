import { Card } from '../../../game/store/card/card';

import { Blastoise } from './blastoise';
import { Dusclops } from './dusclops';
import { Dusknoir } from './dusknoir';
import { Duskull } from './duskull';
import { KeldeoEx } from './keldeo-ex';
import { LandorusEx } from './landorus-ex';
import { Munna } from './munna';
import { Squirtle } from './squirtle';
import { Wartortle } from './wartortle';

import { AspertiaCityGym } from './aspertia-city-gym';
import { ComputerSearch } from './computer-search';
import { Potion } from './potion';
import { RockyHelmet } from './rocky-helmet';
import { Skyla } from './skyla';


export const boundariesCrossed: Card[] = [
  new Blastoise(),
  new ComputerSearch(),
  new Dusclops(),
  new Dusknoir(),
  new Duskull(),
  new KeldeoEx(),
  new LandorusEx(),
  new Munna(),
  new Squirtle(),
  new Wartortle(),

  new AspertiaCityGym(),
  new Potion(),
  new RockyHelmet(),
  new Skyla(),
];