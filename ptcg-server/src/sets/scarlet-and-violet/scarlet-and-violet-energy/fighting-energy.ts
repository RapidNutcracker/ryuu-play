import { CardType, EnergyType } from '../../../game/store/card/card-types';
import { EnergyCard } from '../../../game/store/card/energy-card';

export class FightingEnergy extends EnergyCard {

  public provides: CardType[] = [CardType.FIGHTING];

  public energyType: EnergyType = EnergyType.BASIC;

  public set: string = 'SVE';

  public name = 'Fighting Energy';

  public fullName = 'Fighting Energy SVE';

}
