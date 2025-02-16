import { CardType, EnergyType } from '../../game/store/card/card-types';
import { EnergyCard } from '../../game/store/card/energy-card';

export class WaterEnergy extends EnergyCard {

  public provides: CardType[] = [CardType.WATER];

  public energyType: EnergyType = EnergyType.BASIC;

  public set: string = 'SVE';

  public name = 'Water Energy';

  public fullName = 'Water Energy SVE';

}
