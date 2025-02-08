import { Card } from '../../game/store/card/card';
import { Artazon } from './artazon';
import { BosssOrders } from './bosss-orders';
import { Iono } from './iono';
import { LuminousEnergy } from './luminous-energy';

import { Mimikyu } from './mimikyu';
import { SuperRod } from './super-rod';

export const paldeaEvolved: Card[] = [
    new Mimikyu(),

    new Artazon(),
    new Iono(),
    new BosssOrders(),

    new LuminousEnergy(),

    new SuperRod(),
];