import { CardType, EnergyType } from '../../game/store/card/card-types';
import { EnergyCard } from '../../game/store/card/energy-card';

export class DarknessEnergy extends EnergyCard {

  public provides: CardType[] = [CardType.DARK];

  public energyType: EnergyType = EnergyType.BASIC;

  public set: string = 'DP';

  public name = 'Darkness Energy';

  public fullName = 'Darkness Energy EVO';

}
