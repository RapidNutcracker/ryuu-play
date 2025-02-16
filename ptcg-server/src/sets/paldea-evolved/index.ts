import { Card } from '../../game/store/card/card';
import { Artazon } from './artazon';
import { BosssOrders } from './bosss-orders';
import { BraveryCharm } from './bravery-charm';
import { Iono } from './iono';
import { LuminousEnergy } from './luminous-energy';
import { Magnemite } from './magnemite';

import { Mimikyu } from './mimikyu';
import { SquawkabillyEx } from './squawkabilly-ex';
import { SuperRod } from './super-rod';

export const paldeaEvolved: Card[] = [

    new Magnemite(), // 65
    new Mimikyu(), // 97

    new SquawkabillyEx(), // 169

    new Artazon(),
    new BraveryCharm(),
    new Iono(),
    new BosssOrders(),

    new LuminousEnergy(),

    new SuperRod(),
];