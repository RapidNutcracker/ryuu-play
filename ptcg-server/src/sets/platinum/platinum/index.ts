import { Card } from '../../../game/store/card/card';

import { CrobatG } from './crobat-g';
import { PokeTurn } from './poke-turn';
import { PokedexHandy } from './pokedex-handy';
import { PokemonRescue } from './pokemon-rescue';
import { UnownR } from './unown-r';


export const platinum: Card[] = [
  new CrobatG(),
  new PokeTurn(),
  new PokedexHandy(),
  new PokemonRescue(),
  new UnownR(),
];