import { Card } from '../../../game/store/card/card';

import { ArchaludonEx } from './archaludon-ex';
import { Deino } from './deino';
import { HydreigonEx } from './hydreigon-ex';
import { LatiasEx } from './latias-ex';
import { Magneton } from './magneton';
import { MiloticEx } from './milotic-ex';
import { PikachuEx } from './pikachu-ex';
import { Zweilous } from './zweilous';

import { TeraOrb } from './tera-orb';
import { CounterGain } from './counter-gain';

export const surgingSparks: Card[] = [

  new MiloticEx(),

  new PikachuEx(),

  new Magneton(),

  new LatiasEx(),

  new Deino(),
  new Zweilous(),
  new HydreigonEx(),

  new ArchaludonEx(),

  new CounterGain(),
  new TeraOrb(),
];