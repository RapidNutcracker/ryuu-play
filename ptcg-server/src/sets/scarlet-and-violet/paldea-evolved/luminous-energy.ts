import { CardType, EnergyType } from '../../../game/store/card/card-types';
import { EnergyCard } from '../../../game/store/card/energy-card';
import { StoreLike } from '../../../game/store/store-like';
import { State } from '../../../game/store/state/state';
import { Effect } from '../../../game/store/effects/effect';
import { CheckProvidedEnergyEffect } from '../../../game/store/effects/check-effects';

export class LuminousEnergy extends EnergyCard {

  public id: number = 191;

  public provides: CardType[] = [];

  public energyType = EnergyType.SPECIAL;

  public set: string = 'PAL';

  public name = 'Luminous Energy';

  public fullName = 'Luminous Energy PAL';

  public text =
    'As long as this card is attached to a Pokémon, it provides every type of Energy ' +
    'but provides only 1 Energy at a time.' +
    '\n' +
    'If the Pokémon this card is attached to has any other Special Energy attached, ' +
    'this card provides {C} Energy instead.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof CheckProvidedEnergyEffect && effect.source.cards.includes(this)) {
      const hasOtherSpecialEnergyAttached = effect.source.cards.some(c =>
        c instanceof EnergyCard &&
        c.energyType === EnergyType.SPECIAL &&
        c !== this);
      if (hasOtherSpecialEnergyAttached) {
        effect.energyMap.push({ card: this, provides: [CardType.COLORLESS] });
      } else {
        effect.energyMap.push({ card: this, provides: [CardType.ANY] });
      }
    }

    return state;
  }

}
