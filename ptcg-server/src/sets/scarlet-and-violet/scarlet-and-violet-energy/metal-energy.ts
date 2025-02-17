import { CardType, EnergyType } from '../../../game/store/card/card-types';
import { EnergyCard } from '../../../game/store/card/energy-card';

export class MetalEnergy extends EnergyCard {

  public provides: CardType[] = [CardType.METAL];

  public energyType: EnergyType = EnergyType.BASIC;

  public set: string = 'SVE';

  public name = 'Metal Energy';

  public fullName = 'Metal Energy SVE';

}
