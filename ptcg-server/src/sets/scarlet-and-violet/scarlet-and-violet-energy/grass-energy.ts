import { CardType, EnergyType } from '../../../game/store/card/card-types';
import { EnergyCard } from '../../../game/store/card/energy-card';

export class GrassEnergy extends EnergyCard {

  public provides: CardType[] = [CardType.GRASS];

  public energyType: EnergyType = EnergyType.BASIC;

  public set: string = 'SVE';

  public name = 'Grass Energy';

  public fullName = 'Grass Energy SVE';

}
