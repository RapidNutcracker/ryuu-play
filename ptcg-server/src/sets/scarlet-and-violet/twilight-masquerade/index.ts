import { Card } from '../../../game/store/card/card';

import { DragapultEx } from './dragapult-ex';
import { Munkidori } from './munkidori';

import { LanasAid } from './lanas-aid';
import { SecretBox } from './secret-box';
import { Tatsugiri } from './tatsugiri';


export const twilightMasquerade: Card[] = [
    new Munkidori(),
    new DragapultEx(),
    new Tatsugiri(),

    new LanasAid(),

    new SecretBox(),
];