import { TrainerCard } from '../../../game/store/card/trainer-card';
import { TrainerType } from '../../../game/store/card/card-types';
import { StoreLike } from '../../../game/store/store-like';
import { State } from '../../../game/store/state/state';
import { Effect } from '../../../game/store/effects/effect';
import { PutDamageEffect } from '../../../game/store/effects/attack-effects';

export class Eviolite extends TrainerCard {

  public trainerType: TrainerType = TrainerType.TOOL;

  public set: string = 'NVI';

  public name: string = 'Eviolite';

  public fullName: string = 'Eviolite NVI';

  public text: string =
    'If the Pokémon this card is attached to is a Basic Pokémon, ' +
    'any damage done to this Pokémon by attacks is reduced by 20 ' +
    '(after applying Weakness and Resistance).';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PutDamageEffect) {
      if (effect.target.tool === this && effect.target.isBasic()) {
        effect.damage -= 20;
      }
    }

    return state;
  }

}
