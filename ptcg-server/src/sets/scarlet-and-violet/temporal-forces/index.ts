import { Card } from '../../../game/store/card/card';

import { Croconaw } from './croconaw';
import { Feraligatr } from './feraligatr';
import { GougingFireEx } from './gouging-fire-ex';
import { Relicanth } from './relicanth';
import { Totodile } from './totodile';

import { BuddyBuddyPoffin } from './buddy-buddy-poffin';
import { NeoUpperEnergy } from './neo-upper-energy';
import { PrimeCatcher } from './prime-catcher';
import { RescueBoard } from './rescue-board';

export const temporalForces: Card[] = [

    new GougingFireEx(),
    new Totodile(),
    new Croconaw(),
    new Feraligatr(),
    new Relicanth(),

    new BuddyBuddyPoffin(),

    new RescueBoard(),
    new NeoUpperEnergy(),

    new PrimeCatcher(),
];