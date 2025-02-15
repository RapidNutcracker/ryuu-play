import { CardType, EnergyType } from '../../game/store/card/card-types';
import { EnergyCard } from '../../game/store/card/energy-card';

export class DoubleColorlessEnergy extends EnergyCard {

  public provides: CardType[] = [CardType.COLORLESS, CardType.COLORLESS];

  public energyType = EnergyType.SPECIAL;

  public set: string = 'BS';

  public name = 'Double Colorless Energy';

  public fullName = 'Double Colorless Energy BS';

  public text: string =
    'Provides {C}{C} energy. ' +
    'Doesn\'t count as a basic Energy card.'

}
