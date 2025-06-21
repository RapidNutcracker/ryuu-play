import { Card } from '../../../game/store/card/card';

import { Duraludon } from './duraludon';

import { AreaZeroUnderdepths } from './area-zero-underdepths';
import { GrandTree } from './grand-tree';
import { GravityGemstone } from './gravity-gemstone';
import { Archaludon } from './archaludon';


export const stellarCrown: Card[] = [

  new Duraludon(),
  new Archaludon(),

  new AreaZeroUnderdepths(),
  new GrandTree(),
  new GravityGemstone(),
];