import { CardType, EnergyType } from '../../../game/store/card/card-types';
import { EnergyCard } from '../../../game/store/card/energy-card';

export class PsychicEnergy extends EnergyCard {

  public provides: CardType[] = [CardType.PSYCHIC];

  public energyType: EnergyType = EnergyType.BASIC;

  public set: string = 'SVE';

  public name = 'Psychic Energy';

  public fullName = 'Psychic Energy SVE';

}
