import { Card } from '../../game/store/card/card';
import { Artazon } from './artazon';
import { Iono } from './iono';
import { LuminousEnergy } from './luminous-energy';

import { Mimikyu } from './mimikyu';

/**
 * Pokémon: 17
4 Totodile TEF 39
3 Croconaw TEF 40
3 Feraligatr TEF 41
3 Munkidori TWM 95
2 Mimikyu PAL 97
2 Relicanth TEF 84

Trainer: 34
4 Iono PAL 185
4 Arven OBF 186
3 Lana's Aid TWM 155
3 Colress's Tenacity SFA 57
2 Professor's Research SVI 189
4 Pokégear 3.0 SVI 186
4 Counter Catcher PAR 160
2 Buddy-Buddy Poffin TEF 144
1 Earthen Vessel PAR 163
1 Night Stretcher SFA 61
3 Luxurious Cape PAR 166
2 Artazon PAL 171
1 Grand Tree SCR 136

Energy: 9
5 Water Energy SVE 11
3 Darkness Energy SVE 15
1 Luminous Energy PAL 191
 */

export const paldeaEvolved: Card[] = [
    new Mimikyu(),

    new Artazon(),
    new Iono(),

    new LuminousEnergy(),
];