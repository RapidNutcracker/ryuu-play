import { TrainerCard } from '../../../game/store/card/trainer-card';
import { TrainerType } from '../../../game/store/card/card-types';
import { StoreLike } from '../../../game/store/store-like';
import { State } from '../../../game/store/state/state';
import { Effect } from '../../../game/store/effects/effect';
import { CheckHpEffect } from '../../../game/store/effects/check-effects';
import { KnockOutEffect } from '../../../game/store/effects/game-effects';
import { StateUtils } from '../../../game/store/state-utils';
import { DealDamageEffect } from '../../../game/store/effects/attack-effects';

export class ExpertBelt extends TrainerCard {

  public trainerType: TrainerType = TrainerType.TOOL;

  public set: string = 'AR';

  public name: string = 'Expert Belt';

  public fullName: string = 'Expert Belt AR';

  public text: string =
    'The Pokémon this card is attached to gets +20 HP and that Pokémon\'s ' +
    'attacks do 20 more damage to your opponent\'s Active Pokémon (before ' +
    'applying Weakness and Resistance). When the Pokémon this card is ' +
    'attached to is Knocked Out, your opponent takes 1 more Prize card.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof CheckHpEffect && effect.target.cards.includes(this)) {
      effect.hp += 20;
    }

    if (effect instanceof DealDamageEffect && effect.source.cards.includes(this)) {
      const opponent = StateUtils.getOpponent(state, effect.player);
      if (effect.damage > 0 && effect.target === opponent.active) {
        effect.damage += 20;
      }
    }

    if (effect instanceof KnockOutEffect && effect.target.tool === this) {
      effect.prizeCount += 1;
    }

    return state;
  }

}
