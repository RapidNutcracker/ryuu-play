import { CardType } from '../../../game/store/card/card-types';
import { EnergyCard } from '../../../game/store/card/energy-card';

export class GrassEnergy extends EnergyCard {

  public provides: CardType[] = [ CardType.GRASS ];

  public set: string = 'BS';

  public name = 'Grass Energy';

  public fullName = 'Grass Energy BS';

}
