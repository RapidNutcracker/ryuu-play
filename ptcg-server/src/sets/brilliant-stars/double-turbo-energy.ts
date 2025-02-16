import { CardType, EnergyType } from '../../game/store/card/card-types';
import { EnergyCard } from '../../game/store/card/energy-card';
import { StoreLike } from '../../game/store/store-like';
import { State } from '../../game/store/state/state';
import { Effect } from '../../game/store/effects/effect';
import { CheckProvidedEnergyEffect } from '../../game/store/effects/check-effects';
import { DealDamageEffect } from '../../game/store/effects/attack-effects';

export class DoubleTurboEnergy extends EnergyCard {

  public provides: CardType[] = [];

  public energyType = EnergyType.SPECIAL;

  public set: string = 'BRS';

  public name = 'Double Turbo Energy';

  public fullName = 'Double Turbo Energy BRS';

  public text =
    'As long as this card is attached to a Pokémon, it provides {C}{C} Energy.' +
    'The attacks of the Pokémon this card is attached to do 20 less damage ' +
    'to your opponent\'s Pokémon (before applying Weakness and Resistance).';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    if (effect instanceof CheckProvidedEnergyEffect && effect.source.cards.includes(this)) {
      effect.energyMap.push({ card: this, provides: [CardType.COLORLESS, CardType.COLORLESS] });
    }

    if (effect instanceof DealDamageEffect && effect.source.cards.includes(this)) {
      effect.damage = Math.max(effect.damage - 20, 0);
    }

    return state;
  }

}
