import { TrainerCard } from '../../game/store/card/trainer-card';
import { TrainerType } from '../../game/store/card/card-types';
import { StoreLike } from '../../game/store/store-like';
import { State } from '../../game/store/state/state';
import { Effect } from '../../game/store/effects/effect';
import { CheckHpEffect } from '../../game/store/effects/check-effects';

export class BraveryCharm extends TrainerCard {

  public id: number = 173;

  public trainerType: TrainerType = TrainerType.TOOL;

  public set: string = 'PAL';

  public name: string = 'Bravery Charm';

  public fullName: string = 'Bravery Charm PAL';

  public text: string =
    'The Basic Pokémon this card is attached to gets +50 HP.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof CheckHpEffect && effect.target.tool === this) {
      if (effect.target.isBasic()) {
        effect.hp += 50;
      }
    }

    return state;
  }

}
