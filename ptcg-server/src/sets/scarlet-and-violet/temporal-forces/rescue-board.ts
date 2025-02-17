import { TrainerCard } from '../../../game/store/card/trainer-card';
import { CardType, TrainerType } from '../../../game/store/card/card-types';
import { StoreLike } from '../../../game/store/store-like';
import { State } from '../../../game/store/state/state';
import { Effect } from '../../../game/store/effects/effect';
import { CheckHpEffect, CheckRetreatCostEffect } from '../../../game/store/effects/check-effects';

export class RescueBoard extends TrainerCard {

  public id: number = 159;

  public trainerType: TrainerType = TrainerType.TOOL;

  public set: string = 'TEF';

  public name: string = 'Rescue Board';

  public fullName: string = 'Rescue Board TEF';

  public text: string =
    'The Retreat Cost of the Pokémon this card is attached to is {C} less. ' +
    'If that Pokémon\'s remaining HP is 30 or less, it has no Retreat Cost.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof CheckRetreatCostEffect && effect.player.active.tool === this) {
      const player = effect.player;

      const checkHpEffect = new CheckHpEffect(player, player.active)
      state = store.reduceEffect(state, checkHpEffect);

      const remainingHp = checkHpEffect.hp - player.active.damage;

      if (remainingHp <= 30) {
        effect.cost = [];
        return state;
      }

      const index = effect.cost.indexOf(CardType.COLORLESS);
      if (index !== -1) {
        effect.cost.splice(index, 1);
      }
    }

    return state;
  }

}
