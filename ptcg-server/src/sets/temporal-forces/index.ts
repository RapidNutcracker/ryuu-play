import { Card } from '../../game/store/card/card';

import { Croconaw } from './croconaw';
import { Feraligatr } from './feraligatr';
import { Relicanth } from './relicanth';
import { Totodile } from './totodile';

import { BuddyBuddyPoffin } from './buddy-buddy-poffin';
import { PrimeCatcher } from './prime-catcher';
import { RescueBoard } from './rescue-board';

export const temporalForces: Card[] = [
    new Totodile(),
    new Croconaw(),
    new Feraligatr(),
    new Relicanth(),

    new BuddyBuddyPoffin(),

    new RescueBoard(),
    
    new PrimeCatcher(),
];