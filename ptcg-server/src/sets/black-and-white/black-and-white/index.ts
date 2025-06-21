import { Card } from '../../../game/store/card/card';

import { Pignite } from './pignite';
import { Reshiram } from './reshiram';
import { Tepig } from './tepig';
import { Zekrom } from './zekrom';
import { Zoroark } from './zoroark';
import { Zorua } from './zorua';

import { PlusPower } from './plus-power';
import { PokemonCommunication } from './pokemon-communication';
import { ProfessorJuniper } from './professor-juniper';
import { Revive } from './revive';
import { TropicalBeach } from './tropical-beach';

export const blackAndWhite: Card[] = [
  new Pignite(),
  new Reshiram(),
  new Tepig(),
  new Zekrom(),
  new Zoroark(),
  new Zorua(),

  new PokemonCommunication(),
  new PlusPower(),
  new ProfessorJuniper(),
  new Revive(),
  new TropicalBeach(),
];