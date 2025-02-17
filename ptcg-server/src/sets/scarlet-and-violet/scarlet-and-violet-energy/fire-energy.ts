import { CardType, EnergyType } from '../../../game/store/card/card-types';
import { EnergyCard } from '../../../game/store/card/energy-card';

export class FireEnergy extends EnergyCard {

  public provides: CardType[] = [CardType.FIRE];

  public energyType: EnergyType = EnergyType.BASIC;

  public set: string = 'SVE';

  public name = 'Fire Energy';

  public fullName = 'Fire Energy SVE';

}
